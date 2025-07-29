package anomalydetector.controller

import anomalydetector.dto.AnomalyRequestDto
import anomalydetector.dto.ReportDto
import anomalydetector.service.AnomalyService
import io.swagger.v3.oas.annotations.Operation
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/anomaly")
class AnomalyController(private val anomalyService: AnomalyService) {
  @Operation(summary = "Detect anomalies in provided data and time range")
  @PostMapping
  fun detectAnomaly(@RequestBody request: AnomalyRequestDto): ResponseEntity<ReportDto> {
    return ResponseEntity.ok(anomalyService.detectAnomaly(request))
  }
}

