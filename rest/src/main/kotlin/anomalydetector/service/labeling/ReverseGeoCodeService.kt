package anomalydetector.service.labeling

import anomalydetector.exceptions.AddressNotFoundException
import kotlinx.coroutines.reactive.awaitSingle
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient

@Service
class ReverseGeoCodeService(private val apiKey: String, builder: WebClient.Builder) {

    private val webClient = builder.baseUrl("https://api.tomtom.com").build()

    suspend fun reverseGeocode(lat: Double, lon: Double): ReverseGeoCodeResponse {
        val response: String =
            webClient
                .get()
                .uri(
                    "/search/2/reverseGeocode/{lat},{lon}.json?key={apiKey}&radius=100",
                    lat,
                    lon,
                    apiKey,
                )
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(String::class.java)
                .awaitSingle()

        return parseFromString(response)
    }

    private fun parseFromString(response: String): ReverseGeoCodeResponse {
        val json = Json { ignoreUnknownKeys = true }
        val parsed = json.decodeFromString<TomTomResponse>(response)

        val firstAddress = parsed.addresses.firstOrNull()?.jsonObject
        val addressObj =
            firstAddress?.get("address")?.jsonObject
                ?: throw AddressNotFoundException("Address not found in response")

        val municipality = addressObj["municipality"]?.jsonPrimitive?.contentOrNull ?: "Unknown"
        val country = addressObj["country"]?.jsonPrimitive?.contentOrNull ?: "Unknown"
        val street = addressObj["street"]?.jsonPrimitive?.contentOrNull ?: "Unknown"

        return ReverseGeoCodeResponse(country, municipality, listOf(street))
    }

    @Serializable data class TomTomResponse(val summary: Summary, val addresses: List<JsonElement>)

    @Serializable data class Summary(val queryTime: Int, val numResults: Int)
}
