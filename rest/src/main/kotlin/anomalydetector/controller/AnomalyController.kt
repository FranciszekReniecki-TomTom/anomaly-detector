package anomalydetector.controller

import anomalydetector.dto.AnomalyLabelRequestDto
import anomalydetector.dto.AnomalyRequestDto
import anomalydetector.dto.LabelDto
import anomalydetector.service.AnomalyService
import anomalydetector.service.FeatureCollection
import io.swagger.v3.oas.annotations.Operation
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/anomaly")
@CrossOrigin(origins = ["*"])
class AnomalyController(private val anomalyService: AnomalyService) {
    @Operation(summary = "Detect anomalies in provided data and time range")
    @PostMapping
    fun detectAnomaly(@RequestBody request: AnomalyRequestDto): ResponseEntity<FeatureCollection> {
        val (startTime, endTime, coordinates, dataType) = request
        return ResponseEntity.ok(
            anomalyService.getFeatureCollection(startTime, endTime, coordinates, dataType)
        )
    }

    @Operation(summary = "Labels given anomaly")
    @PostMapping("/label")
    fun labelAnomaly(@RequestBody request: AnomalyLabelRequestDto): ResponseEntity<LabelDto> {
        return ResponseEntity.ok(anomalyService.labelAnomaly(request))
    }
}
