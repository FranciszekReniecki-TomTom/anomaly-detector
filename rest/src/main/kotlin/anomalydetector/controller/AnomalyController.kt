package anomalydetector.controller

import anomalydetector.dto.AnomalyRequestDto
import anomalydetector.dto.DataType
import anomalydetector.dto.ReportDto
import anomalydetector.model.TrafficTileHour
import anomalydetector.model.engine.findClusters
import anomalydetector.service.detection.findOutliers
import anomalydetector.service.trafficdata.getData
import com.tomtom.tti.nida.morton.geom.MortonTileLevel
import com.tomtom.tti.nida.morton.geometry
import io.swagger.v3.oas.annotations.Operation
import jakarta.validation.Valid
import org.locationtech.jts.geom.GeometryFactory
import org.locationtech.jts.geom.Polygon
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import org.locationtech.jts.geom.Coordinate as JtsCoordinate

val MIN_LON = -180.0
val MAX_LON = 180.0
val MIN_LAT = -90.0
val MAX_LAT = 90.0
val LON_RANGE = MAX_LON - MIN_LON
val LAT_RANGE = MAX_LAT - MIN_LAT

data class GeoJsonPolygon(
    val type: String = "Polygon",
    val coordinates: List<List<List<Double>>>,
)

data class GeoJsonFeature(
    val type: String = "Feature",
    val geometry: GeoJsonPolygon,
    val properties: Map<String, Any>, // or custom Properties class
)

data class FeatureCollection(
    val type: String = "FeatureCollection",
    val features: List<GeoJsonFeature>,
)

@RestController
@RequestMapping("/anomaly")
@Validated
open class AnomalyController {
    @Operation(summary = "Detect anomalies in provided data and time range")
    @PostMapping
    fun detectAnomaly(
        @Valid @RequestBody request: AnomalyRequestDto,
    ): ResponseEntity<FeatureCollection> {
        return ResponseEntity.ok(getAnomalies(request))
    }

    @GetMapping("/ping")
    fun ping() = "pong"

    fun getAnomalies(anomalyRequestDto: AnomalyRequestDto): FeatureCollection {
        val (startDay, endDay, coordinates, dataType) = anomalyRequestDto

        val keyExtractorFunction: (TrafficTileHour) -> Double =
            when (dataType) {
                DataType.TOTAL_DISTANCE_M -> { e -> e.traffic.totalDistanceM.toDouble() }
                DataType.SPEED_KHM -> { e -> e.traffic.speedKmH }
                DataType.FREE_FLOW_SPEED_KHM -> { e -> e.traffic.freeFlowSpeedKmH }
            }

        // [tileId, hour] -> [number]
        val geoDataToOutlierHoursToNumber: Map<Pair<Long, Long>, Double> =
            getData(startDay, endDay, coordinates.toPolygon())
                .groupBy { it.mortonTileId }
                .flatMap { (tileId, listForTile) ->
                    val hourToValue =
                        listForTile
                            .associate { it.trafficMeasurementDateTime to keyExtractorFunction(it) }
                            .toSortedMap()

                    val outlierIndices = findOutliers(hourToValue.values.toList()).toSet()

                    hourToValue.entries
                        .withIndex()
                        .filter { it.index in outlierIndices }
                        .map { indexedEntry ->
                            val dateTime = indexedEntry.value.key
                            val number = indexedEntry.value.value
                            val hourSinceEpoch = dateTime.toEpochSecond(ZoneOffset.UTC) / 3600L
                            (tileId to hourSinceEpoch) to number
                        }
                }.toMap()

        // [tileId, hour] -> [lon, lat, hour]
        val tileHourToLonLatHour: Map<Pair<Long, Long>, List<Double>> =
            geoDataToOutlierHoursToNumber.keys.associate { (tileId, hourSinceEpoch) ->
                val tile = MortonTileLevel.M19.getTile(tileId)
                val lon = tile.lon
                val lat = tile.lat
                (tileId to hourSinceEpoch) to
                    listOf(
                        lon,
                        lat,
                        hourSinceEpoch.toDouble(),
                    )
            }

        // List of keys in the same order as the clustering input
        val tileHourKeys: List<Pair<Long, Long>> = tileHourToLonLatHour.keys.toList()

        // [[Int]]
        val clusters: List<List<Int>> =
            findClusters(
                tileHourToLonLatHour.values
                    .map { doubleArrayOf(it[0], it[1], it[2]) }
                    .toTypedArray<DoubleArray>(),
            ).dropLast(1)

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
                }.groupBy { it.first } // group by hour (LocalDateTime)
                .mapValues { (_, triples) ->
                    triples.associate { (_, clusterId, polygon) -> clusterId to polygon }
                }

        return buildFeatureCollection(hourToClusters)
    }
}

fun polygonToGeoJson(polygon: Polygon) = GeoJsonPolygon(coordinates = listOf(polygon.coordinates.map { listOf(it.y, it.x) }))

fun buildFeatureCollection(data: Map<LocalDateTime, Map<Int, Polygon>>): FeatureCollection =
    FeatureCollection(
        features =
            data.flatMap { (dataTime, map) ->
                map.map { (classId, polygon) ->
                    GeoJsonFeature(
                        type = "Feature",
                        geometry = polygonToGeoJson(polygon),
                        properties =
                            mapOf(
                                "classId" to classId,
                                "time" to dataTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")),
                            ),
                    )
                }
            },
    )

fun List<List<Double>>.toPolygon(geometryFactory: GeometryFactory = GeometryFactory()): Polygon =
    let { coordinates ->
        require(coordinates.all { it.size == 2 }) {
            "Each coordinate must have exactly two elements [lat, lon]"
        }
        require(coordinates.isNotEmpty()) { "Coordinate list must not be empty" }
        geometryFactory.createPolygon(
            geometryFactory.createLinearRing(
                (
                    if (coordinates.first() != coordinates.last()) {
                        coordinates + listOf(coordinates.first())
                    } else {
                        coordinates
                    }
                ).map { (lat, lon) -> JtsCoordinate(lon, lat) }
                    .toTypedArray<JtsCoordinate>(),
            ),
            null,
        )
    }
