package anomalydetector.service.labeling

data class ReverseGeoCodeResponse(
    val country: String,
    val municipality: String,
    val streets: List<String>,
)
