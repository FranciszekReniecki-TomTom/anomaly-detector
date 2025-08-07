package anomalydetector.service

import anomalydetector.dto.DataType
import anomalydetector.model.TrafficTileHour
import anomalydetector.model.engine.findClusters
import anomalydetector.model.engine.findWeeklyOutliers
import anomalydetector.service.trafficdata.getData
import com.tomtom.tti.nida.morton.geom.MortonTileLevel
import com.tomtom.tti.nida.morton.geometry
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import kotlin.collections.toDoubleArray
import org.locationtech.jts.geom.Coordinate as JtsCoordinate
import org.locationtech.jts.geom.GeometryFactory
import org.locationtech.jts.geom.Polygon
import anomalydetector.controller.FeatureCollection
import anomalydetector.controller.toPolygon
import anomalydetector.dto.AnomalyLabelRequestDto
import anomalydetector.dto.AnomalyRequestDto
import anomalydetector.dto.DataType
import anomalydetector.dto.LabelDto
import anomalydetector.dto.ReportDto
import anomalydetector.model.TrafficTileHour
import anomalydetector.model.engine.findClusters
import anomalydetector.service.detection.findOutliers
import anomalydetector.service.labeling.AnomalySliceHour
import anomalydetector.service.labeling.GeoTime
import anomalydetector.service.labeling.LlmLabelingService
import anomalydetector.service.labeling.ReverseGeoCodeService
import anomalydetector.service.trafficdata.getData
import com.tomtom.tti.nida.morton.geom.MortonTileLevel
import java.time.LocalDateTime
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
