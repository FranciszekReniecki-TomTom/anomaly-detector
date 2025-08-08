package anomalydetector.service

class AnomalyServiceTest {

    //    @Test
    //    fun `given geojson retrieves geoTime`() {
    //        val service =
    //            AnomalyService(
    //                reverseGeoCodeService = ReverseGeoCodeService(WebClient.builder()),
    //                llmLabelingService = LlmLabelingService(WebClient.builder()),
    //            )
    //
    //        val geojson =
    //            """
    //        {
    //          "type": "FeatureCollection",
    //          "features": [
    //            {
    //              "type": "Feature",
    //              "geometry": {
    //                "type": "Polygon",
    //                "coordinates": [
    //                  [
    //                    [67.6763070001926, 37.256328132759286],
    //                    [77.6763070001926, 37.256328132759286],
    //                    [77.6763070001926, 47.256328132759286],
    //                    [67.6763070001926, 47.256328132759286],
    //                    [67.6763070001926, 37.256328132759286]
    //                  ]
    //                ]
    //              },
    //              "properties": {
    //                "report_id": "report1",
    //                "anomaly_id": "anomaly1",
    //                "timestamp": "2025-01-01T00:00:00Z"
    //              }
    //            }
    //          ]
    //        }
    //        """
    //
    //        val json = Json { ignoreUnknownKeys = true }
    //        val requestDto = json.decodeFromString<AnomalyLabelRequestDto>(geojson)
    //
    //        val geoTimePoints: List<GeoTime> = service.retrieveGeoTimePoints(requestDto)
    //
    //        assertEquals(LocalDateTime.of(2025, 1, 1, 0, 0), geoTimePoints.first().time)
    //    }
}
