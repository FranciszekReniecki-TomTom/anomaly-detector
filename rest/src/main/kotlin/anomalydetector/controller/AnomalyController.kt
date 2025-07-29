package anomalydetector.controller

import anomalydetector.dto.AnomalyRequestDto
import anomalydetector.dto.ReportDto
import anomalydetector.service.AnomalyService
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody

@Controller("/anomaly")
class AnomalyController(private val anomalyService: AnomalyService) {
  @PostMapping
  fun detectAnomaly(@RequestBody request: AnomalyRequestDto): ResponseEntity<ReportDto> {
    return ResponseEntity.ok(anomalyService.detectAnomaly(request))
  }
}

