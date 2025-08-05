package anomalydetector.dto

import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

enum class DataType {
    TOTAL_DISTANCE_M,
    SPEED_KHM,
    FREE_FLOW_SPEED_KHM,
}

data class AnomalyRequestDto(
    @field:NotNull val startDay: LocalDateTime,
    @field:NotNull val endDay: LocalDateTime,
    @field:NotEmpty @field:Size(min = 3) val polygon: List<List<Double>>,
    @field:NotNull val dataType: DataType,
)
