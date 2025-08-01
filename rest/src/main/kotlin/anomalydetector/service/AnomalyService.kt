package anomalydetector.service

import anomalydetector.dto.AnomalyRequestDto
import anomalydetector.dto.DataType
import anomalydetector.dto.ReportDto
import anomalydetector.model.TrafficTileHour
import anomalydetector.model.engine.findClusters
import anomalydetector.service.detection.findOutliers
import anomalydetector.service.repository.ReportService
import anomalydetector.service.trafficdata.getData
import com.tomtom.tti.nida.morton.geom.MortonTileLevel
import com.tomtom.tti.nida.morton.geometry
import java.time.LocalDateTime
import java.time.ZoneOffset
import org.locationtech.jts.geom.Polygon
import org.springframework.stereotype.Service

val MIN_LON = -180.0
val MAX_LON = 180.0
val MIN_LAT = -90.0
val MAX_LAT = 90.0
val LON_RANGE = MAX_LON - MIN_LON
val LAT_RANGE = MAX_LAT - MIN_LAT

@Service
class AnomalyService(val reportService: ReportService) {
    fun detectAnomaly(anomalyRequestDto: AnomalyRequestDto): ReportDto {
        val (startDay, endDay, geometry, dataType) = anomalyRequestDto

        val keyExtractor: (TrafficTileHour) -> Double =
            when (dataType) {
                DataType.TOTAL_DISTANCE_M -> { e -> e.traffic.totalDistanceM.toDouble() }
                DataType.SPEED_KHM -> { e -> e.traffic.speedKmH }
                DataType.FREE_FLOW_SPEED_KHM -> { e -> e.traffic.freeFlowSpeedKmH }
            }

        // [tileId, hour, data]
        val trafficData: List<TrafficTileHour> = getData(startDay, endDay, geometry)

        // [tileId] -> [hour -> someNumber]
        val tiloHourlyFullData: Map<Long, Map<LocalDateTime, Double>> =
            trafficData
                .groupBy { it.mortonTileId }
                .mapValues { (_, listForTile) ->
                    listForTile.associate { it.hourOfTheDay to keyExtractor(it) }.toSortedMap()
                }

        // [tileId] -> [outlier_hours -> number]
        val tiloHourlyOutlierData: Map<Long, Map<LocalDateTime, Double>> =
            tiloHourlyFullData.mapValues { (_, hourToValue) ->
                val dataSeries = hourToValue.values.toList() // keep order
                val outlierIndices = findOutliers(dataSeries).toSet()
                hourToValue.entries
                    .withIndex()
                    .filter { it.index in outlierIndices }
                    .associate { it.value.key to it.value.value }
                    .toSortedMap()
            }

        // [longitude, latitude, polygon] -> [outlier_hours -> number]
        val geoDataToOutlierHoursToNumber:
            Map<Triple<Double, Double, Polygon>, Map<LocalDateTime, Double>> =
            tiloHourlyOutlierData
                .map { (tileId, hourToValue) ->
                    val tile = MortonTileLevel.M14.getTile(tileId)
                    val (longitude, latitude) = tile.lon to tile.lat
                    val polygon = tile.geometry() as Polygon
                    val dataSeries = hourToValue.values.toList()
                    val outlierIndices = findOutliers(dataSeries).toSet()
                    val outlierHourMap =
                        hourToValue.entries
                            .withIndex()
                            .filter { it.index in outlierIndices }
                            .associate { it.value.key to it.value.value }
                            .toSortedMap()
                    Triple(longitude, latitude, polygon) to outlierHourMap
                }
                .toMap()

        data class PointRef(
            val tileId: Long,
            val polygon: Polygon,
            val hour: LocalDateTime,
            val longitude: Double,
            val latitude: Double,
            val value: Double,
        )

        // flatten and keep references
        val flatPoints: List<PointRef> =
            geoDataToOutlierHoursToNumber.flatMap { (geoTriple, hourToNumber) ->
                val (longitude, latitude, polygon) = geoTriple

                // This is a quick way if tileId is not directly accessible here (not ideal for
                // perf)
                val tileId =
                    tiloHourlyFullData.keys.firstOrNull { id ->
                        val tile = MortonTileLevel.M14.getTile(id)
                        tile.lon == longitude && tile.lat == latitude
                    } ?: error("tileId not found for lon=$longitude lat=$latitude")

                hourToNumber.map { (hour, value) ->
                    PointRef(tileId, polygon, hour, longitude, latitude, value)
                }
            }

        val minTimeInSeconds = anomalyRequestDto.startDay.toEpochSecond(ZoneOffset.UTC).toDouble()
        val maxTimeInSeconds = anomalyRequestDto.endDay.toEpochSecond(ZoneOffset.UTC).toDouble()
        val dbscanInputPoints: List<Triple<Double, Double, Double>> =
            flatPoints.map { dataPoint ->
                val time = dataPoint.hour.toEpochSecond(ZoneOffset.UTC).toDouble()
                Triple(
                    (dataPoint.longitude - MIN_LON) / LON_RANGE,
                    (dataPoint.latitude - MIN_LAT) / LAT_RANGE,
                    (time - minTimeInSeconds) / (maxTimeInSeconds - minTimeInSeconds),
                )
            }

        // [ [index, index, index], ...]
        val clustered: List<List<Int>> =
            findClusters(
                dbscanInputPoints
                    .map { doubleArrayOf(it.first, it.second, it.third) }
                    .toTypedArray(),
                minN = 2,
                radius = 0.1,
            )

        // [ [PointRef, PointRef, PointRef], ...]
        val structs: List<List<PointRef>> =
            clustered.map { cluster -> cluster.map { index -> flatPoints[index] } }

        // [Int -> [PointRef]]
        val classIdToCluster: Map<Int, List<PointRef>> =
            structs.withIndex().associate { (index, points) -> index to points }

        // TODO : Save the report using reportService

        // Step 1: flatten into List of (clusterId, pointRef)
        val clusteredPoints: List<Pair<Int, PointRef>> =
            classIdToCluster.flatMap { (clusterId, points) ->
                points.map { point -> clusterId to point }
            }

        // Step 2: group by hour
        val hourToClusteredPoints: Map<LocalDateTime, List<Pair<Int, PointRef>>> =
            clusteredPoints.groupBy { (_, pointRef) -> pointRef.hour }

        return ReportDto(
            name = "Anomaly Report",
            hourToClassIdToPolygon =
                hourToClusteredPoints.mapValues { (_, list) ->
                    list.map { (classId, pointRef) -> classId to pointRef.polygon }
                },
        )
    }
}
