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
import com.tomtom.tti.nida.morton.geom.MortonTileLevel
import java.time.Duration
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import kotlin.collections.toDoubleArray
import kotlin.collections.toTypedArray
import kotlinx.coroutines.runBlocking
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.locationtech.jts.geom.Polygon
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

private val log: Logger = LoggerFactory.getLogger(AnomalyService::class.java)

private const val DIMENSION_SCALE_CONSTANT = 40.0 // meters per hour
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

data class GeoJsonPolygon(
    val type: String = "Polygon",
    val coordinates: List<List<List<Double>>>
)

@Service
class AnomalyService(
    private val aaSecrets: AASecrets,
    private val reverseGeoCodeService: ReverseGeoCodeService,
    private val llmLabelingService: LlmLabelingService,
) {

    fun findAnomalies(
        startTime: LocalDateTime,
        endTime: LocalDateTime,
        coordinates: List<List<Double>>,
        dataType: DataType,
    ): FeatureCollection {
        log.info("Starting anomaly detection...")

        val data = runBlocking {
            AreaAnalyticsDataService(aaSecrets)
                .getData(startTime, endTime, coordinates.toPolygon())
        }
        log.info("Data retrieved: ${data.size} records")

        val validTilesById: Map<Long, List<TrafficTileHour>> = data
            .groupBy { it.mortonTileId }
            .filter {
                it.value.size >= MIN_COVERAGE * Duration.between(startTime, endTime).toHours()
            }
        log.info("Filtered valid tiles: ${validTilesById.size} tiles")

        val outlierTiles: List<TrafficTileHour> = validTilesById
            .map { (_, tileData) ->
                val values: DoubleArray = extractValues(tileData, dataType, startTime, endTime)
                findWeeklyOutliers(values, 2.0).map { tileData[it] }
            }
            .flatten()
            .toList()
        log.info("Outliers found: ${outlierTiles.size} records")

        val outlierGeoPoints: Array<DoubleArray> = outlierTiles
            .map { tile ->
                val geom = MortonTileLevel.M19.getTile(tile.mortonTileId)
                val hour = Duration.between(startTime, tile.trafficMeasurementDateTime).toHours().toDouble()
                doubleArrayOf(geom.lon, geom.lat, hour)
            }
            .toTypedArray()

        val clusters: List<List<TrafficTileHour>> = findClusters(outlierGeoPoints)
            .map { cluster ->
                cluster.map { outlierTiles[it] }
            }
        log.info("Clusters found: ${clusters.size} clusters")

        val timeToPolygon = clusters
            .withIndex()
            .map { (index, clusterTiles) ->
                clusterTiles
                    .groupBy { it.trafficMeasurementDateTime }
                    .map { (time, tiles) ->
                        val polygon: Polygon = tiles.map {
                            val geom = MortonTileLevel.M19.getTile(it.mortonTileId)
                            listOf(geom.lon, geom.lat)
                        }.toPolygon()
                        Pair(index, time) to polygon
                    }
            }
            .flatten()
            .toMap()

        return FeatureCollection(
            features = timeToPolygon.map { (key, polygon) ->
                GeoJsonFeature(
                    geometry = GeoJsonPolygon(
                        coordinates = listOf(polygon.coordinates.map { listOf(it.x, it.y) })
                    ),
                    properties = mapOf(
                        "classId" to key.first,
                        "time" to key.second.format(
                            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")
                        )
                    )
                )
            }
        )
    }

    private fun extractValues(
        tileData: List<TrafficTileHour>,
        dataType: DataType,
        startTime: LocalDateTime,
        endTime: LocalDateTime
    ): DoubleArray {
        val times: List<LocalDateTime> = generateSequence(startTime) { it.plusDays(1) }
            .takeWhile { it <= endTime }
            .toList()
        val timeToTile: Map<LocalDateTime, TrafficTileHour> = tileData.associateBy { it.trafficMeasurementDateTime }

        return times.map { time ->
            timeToTile[time]?.let { tile ->
                when (dataType) {
                    DataType.SPEED_KHM -> tile.traffic.speedKmH
                    DataType.TOTAL_DISTANCE_M -> tile.traffic.totalDistanceM.toDouble()
                    DataType.FREE_FLOW_SPEED_KHM -> tile.traffic.freeFlowSpeedKmH
                    DataType.CONGESTION -> tile.congestion()
                }
            } ?: Double.NaN
        }.toDoubleArray()
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

    private fun retrieveGeoTimePoints(request: AnomalyLabelRequestDto): List<GeoTime> =
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

private fun TrafficTileHour.congestion(): Double =
    ((traffic.freeFlowSpeedKmH - traffic.speedKmH) / traffic.freeFlowSpeedKmH)
        .takeIf { traffic.freeFlowSpeedKmH > 0 } ?: 0.0