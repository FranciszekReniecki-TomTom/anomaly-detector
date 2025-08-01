package anomalydetector.service

import anomalydetector.dto.AnomalyRequestDto
import anomalydetector.dto.ReportDto
import org.springframework.stereotype.Service

@Service
class AnomalyService {
    fun detectAnomaly(anomalyRequestDto: AnomalyRequestDto): ReportDto {

        return ReportDto(listOf(1, 2, 3))
    }
}
