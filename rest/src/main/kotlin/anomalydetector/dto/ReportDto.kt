package anomalydetector.dto

import anomalydetector.service.FeatureCollection

data class ReportDto(val name: String, val hourToClassIdToPolygon: FeatureCollection)
