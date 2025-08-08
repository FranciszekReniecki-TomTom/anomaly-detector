package anomalydetector.service

import anomalydetector.dto.AnomalyLabelRequestDto
import anomalydetector.service.labeling.GeoTime
import java.time.LocalDateTime
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlinx.serialization.json.Json

class AnomalyServiceTest(private val anomalyService: AnomalyService) {

    @Test
    fun `given geojson retrieves geoTime`() {
        val geojson =
            """
        {
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "geometry": {
                "type": "Polygon",
                "coordinates": [
                  [
                    [67.6763070001926, 37.256328132759286],
                    [77.6763070001926, 37.256328132759286],
                    [77.6763070001926, 47.256328132759286],
                    [67.6763070001926, 47.256328132759286],
                    [67.6763070001926, 37.256328132759286]
                  ]
                ]
              },
              "properties": {
                "report_id": "report1",
                "anomaly_id": "anomaly1",
                "timestamp": "2025-01-01T00:00:00Z"
              }
            }
          ]
        }
        """

        val json = Json { ignoreUnknownKeys = true }
        val requestDto = json.decodeFromString<AnomalyLabelRequestDto>(geojson)

        val geoTimePoints: List<GeoTime> = anomalyService.retrieveGeoTimePoints(requestDto)

        assertEquals(LocalDateTime.of(2025, 1, 1, 0, 0), geoTimePoints.first().time)
    }
}
