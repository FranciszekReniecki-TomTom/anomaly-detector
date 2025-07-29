package anomalydetector.dto

data class ReportDto(
  val anomalies: List<Byte> = emptyList()
)