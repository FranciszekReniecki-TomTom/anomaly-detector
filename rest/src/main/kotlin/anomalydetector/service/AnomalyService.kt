package anomalydetector.service

import anomalydetector.dto.AnomalyRequestDto
import anomalydetector.dto.ReportDto
import anomalydetector.model.TrafficTileHour
import anomalydetector.model.findAnomalies
import org.springframework.stereotype.Service

@Service
class AnomalyService {
  fun detectAnomaly(anomalyRequestDto: AnomalyRequestDto): ReportDto {

    val anomalies: List<TrafficTileHour> = findAnomalies(
      anomalyRequestDto.startDay,
      anomalyRequestDto.days,
      anomalyRequestDto.tile,
      anomalyRequestDto.level,
      anomalyRequestDto.geometry
    )

    return ReportDto(listOf(1, 2, 3))
  }
}