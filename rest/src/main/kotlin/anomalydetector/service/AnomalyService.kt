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
import anomalydetector.service.trafficdata.getData
import com.tomtom.tti.nida.morton.geom.MortonTileLevel
import com.tomtom.tti.nida.morton.geometry
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import kotlin.collections.toDoubleArray
import kotlinx.coroutines.runBlocking
import org.locationtech.jts.geom.Coordinate as JtsCoordinate
import kotlin.collections.toTypedArray
import kotlinx.coroutines.runBlocking
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.locationtech.jts.geom.Polygon
import org.springframework.stereotype.Service

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
    private val reverseGeoCodeService: ReverseGeoCodeService,
    private val llmLabelingService: LlmLabelingService,
) {
    fun detectAnomaly(anomalyRequestDto: AnomalyRequestDto): ReportDto {
        val trafficData =
            getData(
                startDay = anomalyRequestDto.startDay,
                days = anomalyRequestDto.days,
                tile = anomalyRequestDto.tile,
                level = MortonTileLevel.M19,
                geometry = anomalyRequestDto.geometry,
            )

        return ReportDto(listOf(1, 2, 3))
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
        "Each coordinate must have exactly two elements [lat, lon]"
    }
    require(coordinates.isNotEmpty()) { "Coordinate list must not be empty" }
    geometryFactory.createPolygon(
        geometryFactory.createLinearRing(
            (if (coordinates.first() != coordinates.last()) {
                    coordinates + listOf(coordinates.first())
                } else {
                    coordinates
                })
                .map { (lat, lon) -> Coordinate(lon, lat) }
                .toTypedArray<Coordinate>()
        ),
        null,
    )
}

class AnomalyService(
    private val reverseGeoCodeService: ReverseGeoCodeService,
    private val llmLabelingService: LlmLabelingService,
) {

    fun labelAnomaly(request: AnomalyLabelRequestDto): LabelDto {
        val name = request.name

        val points: List<GeoTime> =
            listOf(
                GeoTime(52.5200, 13.4050, LocalDateTime.now()),
                GeoTime(48.8566, 2.3522, LocalDateTime.now().minusDays(1)),
                GeoTime(51.5074, -0.1278, LocalDateTime.now().minusDays(2)),
            )

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

    fun getFeatureCollection(
        startTime: LocalDateTime,
        endTime: LocalDateTime,
        coordinates: List<List<Double>>,
        dataType: DataType,
        min_coverage: Double = 0.75,
    ): FeatureCollection {

        val data = getData(startTime, endTime, coordinates.toPolygon())

        val allHours: List<LocalDateTime> =
            generateSequence(startTime) { it.plusHours(1) }
                .takeWhile { !it.isAfter(endTime) }
                .toList()

        val expectedSize = (allHours.size * min_coverage).toInt()

        val tileIdToFullTrafficData: Map<Long, List<TrafficTileHour?>> =
            data
                .groupBy { it.mortonTileId }
                .filter { (_, tileData) -> tileData.size >= expectedSize }
                .mapValues { (_, tileData) ->
                    val byHour: Map<LocalDateTime, TrafficTileHour> =
                        tileData.associateBy { it.trafficMeasurementDateTime }
                    allHours.map { hour -> byHour[hour] }
                }
        println("Number of mappings: ${tileIdToFullTrafficData.size}")

        // [tileId, hour] -> [number]
        val geoDataToOutlierHoursToNumber: Map<Pair<Long, Long>, Double> =
            tileIdToFullTrafficData
                .flatMap { (tileId: Long, listForTile: List<TrafficTileHour?>) ->
                    val values: List<Double?> =
                        listForTile.map { trafficTileHour ->
                            trafficTileHour?.traffic?.totalDistanceM?.toDouble()
                        }

                    val valuesWithNaNs: DoubleArray =
                        values.map { it ?: Double.NaN }.toDoubleArray()

                    val outlierIndexes = findWeeklyOutliers(valuesWithNaNs, threshold = 2.0).toSet()
                    println("Number of outliers for tile $tileId: ${outlierIndexes.size}")

                    values
                        .withIndex()
                        .filter { (index, _) -> index in outlierIndexes }
                        .map { (index, value) ->
                            val hourSinceEpoch =
                                listForTile[index]!!
                                    .trafficMeasurementDateTime
                                    .toEpochSecond(ZoneOffset.UTC) / 3600L
                            (tileId to hourSinceEpoch) to value!!
                        }
                }
                .toMap()

        // [tileId, hour] -> [lon, lat, hour]
        val tileHourToLonLatHour: Map<Pair<Long, Long>, List<Double>> =
            geoDataToOutlierHoursToNumber.keys.associate { (tileId, hourSinceEpoch) ->
                val tile = MortonTileLevel.M19.getTile(tileId)
                val lon = tile.lon
                val lat = tile.lat
                (tileId to hourSinceEpoch) to listOf(lon, lat, hourSinceEpoch.toDouble())
            }

        // List of keys in the same order as the clustering input
        val tileHourKeys: List<Pair<Long, Long>> = tileHourToLonLatHour.keys.toList()

        // [[Int]]
        val clusters: List<List<Int>> =
            findClusters(
                    tileHourToLonLatHour.values
                        .map { doubleArrayOf(it[0], it[1], it[2]) }
                        .toTypedArray<DoubleArray>()
                )
                .dropLast(1)

        // TODO: implement report creation

        val hourToClusters: Map<LocalDateTime, Map<Int, Polygon>> =
            clusters
                .withIndex()
                .flatMap { (clusterId, indexesInCluster) ->
                    indexesInCluster.map { idx ->
                        val (tileId, hourSinceEpoch) = tileHourKeys[idx]
                        val hour =
                            LocalDateTime.ofInstant(
                                Instant.ofEpochSecond(hourSinceEpoch * 3600L),
                                ZoneOffset.UTC,
                            )
                        val polygon = MortonTileLevel.M19.getTile(tileId).geometry() as Polygon
                        Triple(hour, clusterId, polygon)
                    }
                }
                .groupBy { it.first } // group by hour (LocalDateTime)
                .mapValues { (_, triples) ->
                    triples.associate { (_, clusterId, polygon) -> clusterId to polygon }
                }

        return buildFeatureCollection(hourToClusters)
    }
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

private fun List<List<Double>>.toPolygon(
    geometryFactory: GeometryFactory = GeometryFactory()
): Polygon = let { coordinates ->
    require(coordinates.all { it.size == 2 }) {
        "Each coordinate must have exactly two elements [lat, lon]"
    }
    require(coordinates.isNotEmpty()) { "Coordinate list must not be empty" }
    geometryFactory.createPolygon(
        geometryFactory.createLinearRing(
            (if (coordinates.first() != coordinates.last()) {
                    coordinates + listOf(coordinates.first())
                } else {
                    coordinates
                })
                .map { (lat, lon) -> JtsCoordinate(lon, lat) }
                .toTypedArray<JtsCoordinate>()
        ),
        null,
    )
}
