package anomalydetector.service

import anomalydetector.dto.AnomalyLabelRequestDto
import anomalydetector.dto.DataType
import anomalydetector.dto.LabelDto
import anomalydetector.model.TrafficTileHour
import anomalydetector.model.engine.findClusters
import anomalydetector.model.engine.findWeeklyOutliers
import anomalydetector.service.labeling.AnomalySliceHour
import anomalydetector.service.labeling.GeoTime
import anomalydetector.service.labeling.LlmLabelingService
import anomalydetector.service.labeling.ReverseGeoCodeService
import anomalydetector.service.trafficdata.AASecrets
import anomalydetector.service.trafficdata.AreaAnalyticsDataService
import com.tomtom.tti.area.analytics.model.traffic.Traffic
import com.tomtom.tti.nida.morton.geom.MortonTileLevel
import com.tomtom.tti.nida.morton.geometry
import java.time.Duration
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import kotlin.collections.toDoubleArray
import kotlin.collections.toTypedArray
import kotlin.math.PI
import kotlin.math.cos
import kotlinx.coroutines.runBlocking
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.locationtech.jts.geom.Polygon
import org.springframework.stereotype.Service

private const val DIMENSTION_SCALE_CONSTANT = 40.0 // meters per hour
const val MIN_COVERAGE: Double = 0.85

data class FeatureCollection(
    val type: String = "FeatureCollection",
    val features: List<GeoJsonFeature>,
)

data class GeoJsonFeature(
    val type: String = "Feature",
    val geometry: GeoJsonPolygon,
    val properties: Map<String, Any>,
)

data class GeoJsonPolygon(val type: String = "Polygon", val coordinates: List<List<List<Double>>>)

@Service
class AnomalyService(
    private val aaSecrets: AASecrets,
    private val reverseGeoCodeService: ReverseGeoCodeService,
    private val llmLabelingService: LlmLabelingService,
) {

    fun getFeatureCollection(
        startTime: LocalDateTime,
        endTime: LocalDateTime,
        coordinates: List<List<Double>>,
        dataType: DataType,
    ): FeatureCollection {

        val data = runBlocking {
            AreaAnalyticsDataService(aaSecrets).getData(startTime, endTime, coordinates.toPolygon())
        }

        val allHours: List<LocalDateTime> =
            generateSequence(startTime) { it.plusHours(1) }
                .takeWhile { !it.isAfter(endTime) }
                .toList()

        val minimalNumberOfDataPoints: Int = (allHours.size * MIN_COVERAGE).toInt()

        val filtered = data
            .groupBy { it.mortonTileId }
            .filter { (_, tileData) ->
                tileData.size >= minimalNumberOfDataPoints
            }

        val tileIdToFullTrafficData: Map<Long, List<TrafficTileHour?>> =
            filtered
                .mapValues { (_, tileData) ->
                    val byHour: Map<LocalDateTime, TrafficTileHour> =
                        tileData.associateBy { it.trafficMeasurementDateTime }
                    allHours.map { hour -> byHour[hour] }
                }

        // [tileId, LocalDateTime] -> [number]
        val geoDataToOutlierHoursToNumber: Map<Pair<Long, LocalDateTime>, Double> =
            tileIdToFullTrafficData
                .flatMap { (tileId: Long, listForTile: List<TrafficTileHour?>) ->
                    val values: DoubleArray =
                        listForTile
                            .map { tile: TrafficTileHour? ->
                                val trafficOrNull: Traffic? = tile?.traffic
                                when (dataType) {
                                    DataType.TOTAL_DISTANCE_M ->
                                        trafficOrNull?.totalDistanceM?.toDouble()
                                    DataType.FREE_FLOW_SPEED_KHM ->
                                        trafficOrNull?.totalDistanceM?.toDouble()
                                    DataType.SPEED_KHM -> trafficOrNull?.speedKmH
                                    DataType.CONGESTION -> {
                                        val freeFlowSpeed: Double =
                                            trafficOrNull?.freeFlowSpeedKmH ?: Double.NaN
                                        val actualSpeed: Double =
                                            trafficOrNull?.speedKmH ?: Double.NaN

                                        if (
                                            freeFlowSpeed.isNaN() ||
                                                actualSpeed.isNaN() ||
                                                freeFlowSpeed <= 0
                                        ) {
                                            Double.NaN
                                        }

                                        val congestion =
                                            if (actualSpeed >= freeFlowSpeed) {
                                                0.0
                                            } else {
                                                ((freeFlowSpeed - actualSpeed) / freeFlowSpeed) *
                                                    100.0
                                            }
                                        congestion
                                    }
                                } ?: Double.NaN
                            }
                            .toDoubleArray()

                    val outlierIndexes = findWeeklyOutliers(values, threshold = 2.0).toSet()
                    println("Number of outliers for tile $tileId: ${outlierIndexes.size}")

                    values
                        .withIndex()
                        .filter { (index, _) -> index in outlierIndexes }
                        .map { (index, value) ->
                            (tileId to listForTile[index]!!.trafficMeasurementDateTime) to value
                        }
                }
                .toMap()

        // [tileId, localDateTime] -> [lon, lat, time]
        val tileHourToRawPoint:
            Map<Pair<Long, LocalDateTime>, Triple<Double, Double, LocalDateTime>> =
            geoDataToOutlierHoursToNumber.keys.associate { (tileId, time) ->
                val tile = MortonTileLevel.M19.getTile(tileId)
                (tileId to time) to Triple(tile.lon, tile.lat, time)
            }

        if (tileHourToRawPoint.isEmpty()) {
            println("No outliers found for the given time range and coordinates.")
            return FeatureCollection(features = emptyList())
        }

        val dataPoints =
            tileHourToRawPoint
                .mapValues { (_, rawPoint: Triple<Double, Double, LocalDateTime>) ->
                    toScaledPoint(
                        rawPoint = rawPoint,
                        referenceRawPoint = tileHourToRawPoint.values.first(),
                    )
                }
                .values
                .toTypedArray()

        val clusters: List<List<Int>> = findClusters(dataPoints)

        val hourToClusters: Map<LocalDateTime, Map<Int, Polygon>> =
            clusters
                .withIndex()
                .flatMap { (clusterId, indexesInCluster) ->
                    indexesInCluster.map { idx ->
                        val (tileId, time) = tileHourToRawPoint.keys.toList()[idx]
                        val polygon = MortonTileLevel.M19.getTile(tileId).geometry() as Polygon
                        Triple(time, clusterId, polygon)
                    }
                }
                .groupBy { it.first } // group by hour (LocalDateTime)
                .mapValues { (_, triples) ->
                    triples.associate { (_, clusterId, polygon) -> clusterId to polygon }
                }

        return buildFeatureCollection(hourToClusters)
    }

    fun toScaledPoint(
        rawPoint: Triple<Double, Double, LocalDateTime>,
        referenceRawPoint: Triple<Double, Double, LocalDateTime>,
    ): DoubleArray {
        val (referenceLongitude, referenceLatitude, referenceTime) = referenceRawPoint

        val (longitude, latitude, time) = rawPoint
        val deltaLat = latitude - referenceLatitude
        val deltaLon = longitude - referenceLongitude
        val deltaTimeHours = Duration.between(referenceTime, time).toHours().toDouble()

        val xMeters = deltaLat * 111000.0
        val yMeters = deltaLon * 111000.0 * cos(referenceLatitude * PI / 180.0)
        val zMeters = deltaTimeHours * DIMENSTION_SCALE_CONSTANT

        return doubleArrayOf(xMeters, yMeters, zMeters)
    }

    fun labelAnomaly(request: AnomalyLabelRequestDto): LabelDto {
        val points: List<GeoTime> = retrieveGeoTimePoints(request)

        val anomalySliceHours: List<AnomalySliceHour> =
            points
                .map { geoTime ->
                    runBlocking {
                        val (country, municipality, streets) =
                            reverseGeoCodeService.reverseGeocode(geoTime.lat, geoTime.lon)
                        AnomalySliceHour(
                            country = country,
                            municipality = municipality,
                            streets = streets,
                            time = geoTime.time,
                        )
                    }
                }
                .toList()

        val llmResponse = runBlocking { llmLabelingService.labelUsingLLM(anomalySliceHours) }

        return LabelDto(llmResponse.response)
    }

    internal fun retrieveGeoTimePoints(request: AnomalyLabelRequestDto): List<GeoTime> =
        request.features.map { feature ->
            val polygon = feature.geometry.coordinates.first().toPolygon()
            val centroid = polygon.centroid
            val lat = centroid.y
            val lon = centroid.x

            println("Processing feature with centroid at ($lat, $lon)")

            val timestamp =
                feature.properties["timestamp"]
                    ?: throw IllegalArgumentException("Feature must contain a 'timestamp' property")
            val datetime = LocalDateTime.parse(timestamp.removeSuffix("Z"))

            println("Parsed timestamp: $datetime")

            GeoTime(lat, lon, datetime)
        }
}

private fun List<List<Double>>.toPolygon(
    geometryFactory: GeometryFactory = GeometryFactory()
): Polygon = let { coordinates ->
    require(coordinates.all { it.size == 2 }) {
        "Each coordinate must have exactly two elements [lon, lat]"
    }
    require(coordinates.isNotEmpty()) { "Coordinate list must not be empty" }
    geometryFactory.createPolygon(
        geometryFactory.createLinearRing(
            (if (coordinates.first() != coordinates.last()) {
                    coordinates + listOf(coordinates.first())
                } else {
                    coordinates
                })
                .map { (lon, lat) -> Coordinate(lon, lat) }
                .toTypedArray<Coordinate>()
        ),
        null,
    )
}

private fun buildFeatureCollection(data: Map<LocalDateTime, Map<Int, Polygon>>): FeatureCollection =
    FeatureCollection(
        features =
            data.flatMap { (dataTime, map) ->
                map.map { (classId, polygon) ->
                    GeoJsonFeature(
                        type = "Feature",
                        geometry =
                            GeoJsonPolygon(
                                coordinates = listOf(polygon.coordinates.map { listOf(it.x, it.y) })
                            ),
                        properties =
                            mapOf(
                                "classId" to classId,
                                "time" to
                                    dataTime.format(
                                        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")
                                    ),
                            ),
                    )
                }
            }
    )
