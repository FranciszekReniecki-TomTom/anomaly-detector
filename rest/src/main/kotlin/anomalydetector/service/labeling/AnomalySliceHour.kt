package anomalydetector.service.labeling

import java.time.LocalDateTime

data class AnomalySliceHour(
    val country: String,
    val municipality: String,
    val streets: List<String>,
    val time: LocalDateTime,
)
