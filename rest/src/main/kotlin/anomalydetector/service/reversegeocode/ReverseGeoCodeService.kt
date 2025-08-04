package anomalydetector.service.reversegeocode

import anomalydetector.service.ReverseGeoCodeResponse
import io.github.cdimascio.dotenv.Dotenv
import kotlinx.coroutines.reactive.awaitSingle
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient

@Service
class ReverseGeoCodeService(private val builder: WebClient.Builder) {

    private val apiKey: String = Dotenv.load()["TT_API_KEY"]
    private val webClient = builder.baseUrl("https://api.tomtom.com").build()

    suspend fun reverseGeocode(lat: Double, lon: Double): ReverseGeoCodeResponse {
        val response: String = webClient.get()
            .uri("/search/2/reverseGeocode/{lat},{lon}.json?key={apiKey}&radius=100", lat, lon, apiKey)
            .accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .bodyToMono(String::class.java)
            .awaitSingle()

        val tomTomResponse = parseFromString(response)

        return ReverseGeoCodeResponse("dupa", "dupa", listOf())
    }

    private fun parseFromString(response: String) {
        val json = Json { ignoreUnknownKeys = true }
        val parsed = json.decodeFromString<TomTomResponse>(response)

        val summary = parsed.summary
        println("Query Time: ${summary.queryTime} ms")
        println("Number of Results: ${summary.numResults}")

        for ((i, element) in parsed.addresses.withIndex()) {
            val address = element.jsonObject["address"]?.jsonObject ?: continue

            val municipality = address["municipality"]?.jsonPrimitive?.contentOrNull
            val postalCode = address["postalCode"]?.jsonPrimitive?.contentOrNull
            val country = address["country"]?.jsonPrimitive?.contentOrNull
            val street = address["street"]?.jsonPrimitive?.contentOrNull

            println("Address #$i:")
            println("- Municipality: $municipality")
            println("- Postal Code: $postalCode")
            println("- Country: $country")
            println("- Street: $street")
        }
    }
}

@Serializable
data class Summary(
    val queryTime: Int,
    val numResults: Int
)

@Serializable
data class TomTomResponse(
    val summary: Summary,
    val addresses: List<JsonElement>
)