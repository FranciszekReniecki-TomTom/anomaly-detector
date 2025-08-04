package anomalydetector.service

import anomalydetector.dto.AnomalyLabelRequestDto
import anomalydetector.dto.AnomalyRequestDto
import anomalydetector.dto.LabelDto
import anomalydetector.dto.ReportDto
import anomalydetector.service.detection.findAnomalies
import anomalydetector.service.llm.LLMLabelingService
import anomalydetector.service.reversegeocode.ReverseGeoCodeService
import anomalydetector.service.trafficdata.getData
import com.tomtom.tti.nida.morton.geom.MortonTileLevel
import kotlinx.coroutines.runBlocking
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class AnomalyService(
    private val reverseGeoCodeService: ReverseGeoCodeService,
    private val llmLabelingService: LLMLabelingService
) {
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

    fun labelAnomaly(request: AnomalyLabelRequestDto): LabelDto {
        val name = request.name

        val points: List<GeoTime> = listOf(
            GeoTime(52.5200, 13.4050, LocalDateTime.now()),
            GeoTime(48.8566, 2.3522, LocalDateTime.now().minusDays(1)),
            GeoTime(51.5074, -0.1278, LocalDateTime.now().minusDays(2))
        )

        val anomalySliceHours: List<AnomalySliceHour> = points.map { geoTime ->
            runBlocking {
                val (country, municipality, streets) = reverseGeoCodeService.reverseGeocode(geoTime.lat, geoTime.lon)
                AnomalySliceHour(
                    country = country,
                    municipality = municipality,
                    streets = streets,
                    time = geoTime.time
                )
            }
        }.toList()


        val llmResponse = llmLabelingService.labelUsingLLM(anomalySliceHours)

        return LabelDto("dupa")
    }
}

data class GeoTime(
    val lat: Double,
    val lon: Double,
    val time: LocalDateTime
)

data class ReverseGeoCodeResponse(
    val country: String,
    val municipality: String,
    val streets: List<String>
)

data class AnomalySliceHour(
    val country: String,
    val municipality: String,
    val streets: List<String>,
    val time: LocalDateTime
)