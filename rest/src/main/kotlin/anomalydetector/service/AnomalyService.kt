package anomalydetector.service

import anomalydetector.dto.AnomalyLabelRequestDto
import anomalydetector.dto.AnomalyRequestDto
import anomalydetector.dto.LabelDto
import anomalydetector.dto.ReportDto
import anomalydetector.service.labeling.AnomalySliceHour
import anomalydetector.service.labeling.GeoTime
import anomalydetector.service.labeling.LLMLabelingService
import anomalydetector.service.labeling.ReverseGeoCodeService
import anomalydetector.service.trafficdata.getData
import com.tomtom.tti.nida.morton.geom.MortonTileLevel
import java.time.LocalDateTime
import kotlinx.coroutines.runBlocking
import org.springframework.stereotype.Service

@Service
class AnomalyService(
    private val reverseGeoCodeService: ReverseGeoCodeService,
    private val llmLabelingService: LLMLabelingService,
) {
    fun detectAnomaly(anomalyRequestDto: AnomalyRequestDto): ReportDto {
        val trafficData =
            getData(
                startDay = anomalyRequestDto.startDay,
                days = anomalyRequestDto.days,
                tile = anomalyRequestDto.tile,
                level = MortonTileLevel.M19,
                geometry = anomalyRequestDto.geometry,
            )

        return ReportDto(listOf(1, 2, 3))
    }

    fun labelAnomaly(request: AnomalyLabelRequestDto): LabelDto {
        val name = request.name

        val datetime = LocalDateTime.of(2020, 6, 14, 14, 0)
        val points: List<GeoTime> =
            listOf(
                GeoTime(51.575332, 18.937928, datetime),
                GeoTime(51.577466, 18.919387, datetime),
                GeoTime(51.574531, 18.947237, datetime),
            )

        val anomalySliceHours: List<AnomalySliceHour> =
            points
                .map { geoTime ->
                    runBlocking {
                        val (country, municipality, streets) =
                            reverseGeoCodeService.reverseGeocode(geoTime.lat, geoTime.lon)
                        AnomalySliceHour(
                            country = country,
                            municipality = municipality,
                            streets = streets,
                            time = geoTime.time,
                        )
                    }
                }
                .toList()

        val llmResponse = runBlocking { llmLabelingService.labelUsingLLM(anomalySliceHours) }

        return LabelDto(llmResponse.response)
    }
}
