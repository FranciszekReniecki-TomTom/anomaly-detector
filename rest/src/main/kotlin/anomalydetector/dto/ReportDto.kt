package anomalydetector.dto

import anomalydetector.controller.FeatureCollection

data class ReportDto(val name: String, val hourToClassIdToPolygon: FeatureCollection)
