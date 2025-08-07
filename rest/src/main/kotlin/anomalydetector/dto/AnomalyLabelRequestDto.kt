package anomalydetector.dto

import kotlinx.serialization.Serializable

@Serializable
data class AnomalyLabelRequestDto(
    val type: String = "Feature Collection",
    val features: List<GeoJsonFeature>
)

@Serializable
data class GeoJsonFeature(
    val type: String = "Feature",
    val geometry: GeoJsonPolygon,
    val properties: Map<String, String>
)

@Serializable
data class GeoJsonPolygon(
    val type: String = "Polygon",
    val coordinates: List<List<List<Double>>>
)