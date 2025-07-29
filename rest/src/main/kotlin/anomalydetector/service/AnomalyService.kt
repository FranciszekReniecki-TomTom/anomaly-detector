package anomalydetector.service

import anomalydetector.dto.AnomalyRequestDto
import anomalydetector.dto.ReportDto
import anomalydetector.service.detection.findAnomalies
import anomalydetector.service.trafficdata.getData
import com.tomtom.tti.nida.morton.geom.MortonTileLevel
import org.springframework.stereotype.Service

@Service
class AnomalyService {
  fun detectAnomaly(anomalyRequestDto: AnomalyRequestDto): ReportDto {
    val trafficData = getData(
      startDay = anomalyRequestDto.startDay,
      days = anomalyRequestDto.days,
      tile = anomalyRequestDto.tile,
      level = MortonTileLevel.M19,
      geometry = anomalyRequestDto.geometry
    )

    val anomalies = findAnomalies(trafficData)

    // create a report, save to db using reportService and return it

    return ReportDto(listOf(1, 2, 3))
  }
}