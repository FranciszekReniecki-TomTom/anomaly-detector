package anomalydetector.service.labeling

import io.github.cdimascio.dotenv.Dotenv
import kotlinx.coroutines.reactive.awaitSingle
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient

@Service
class ReverseGeoCodeService(builder: WebClient.Builder) {

    private val apiKey: String = Dotenv.load()["TT_API_KEY"]
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

        val summary = parsed.summary
        println("Query Time: ${summary.queryTime} ms")
        println("Number of Results: ${summary.numResults}")

        var municipality = "Unknown"
        var country = "Unknown"
        var street = "Unknown"

        val firstAddress = parsed.addresses.firstOrNull()?.jsonObject
        val addressObj = firstAddress?.get("address")?.jsonObject

        if (addressObj != null) {
            municipality = addressObj["municipality"]?.jsonPrimitive?.contentOrNull ?: municipality
            country = addressObj["country"]?.jsonPrimitive?.contentOrNull ?: country
            street = addressObj["street"]?.jsonPrimitive?.contentOrNull ?: street

            println("Parsed address:")
            println("- Municipality: $municipality")
            println("- Country: $country")
            println("- Street: $street")
        } else {
            println("No address found.")
        }

        return ReverseGeoCodeResponse(country, municipality, listOf(street))
    }

    @Serializable
    data class TomTomResponse(val summary: Summary, val addresses: List<JsonElement>)

    @Serializable
    data class Summary(val queryTime: Int, val numResults: Int)
}
