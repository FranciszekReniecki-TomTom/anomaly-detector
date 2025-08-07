package anomalydetector.service.labeling

import io.github.cdimascio.dotenv.Dotenv
import kotlinx.coroutines.reactive.awaitSingle
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient

@Service
class LlmLabelingService(builder: WebClient.Builder) {
    private val apiKey: String = Dotenv.load()["GROQ_API_KEY"]
    private val webClient =
        builder
            .baseUrl("https://api.groq.com/openai/v1/chat/completions")
            .defaultHeader("Authorization", "Bearer $apiKey")
            .build()

    private val modelId = "moonshotai/kimi-k2-instruct"
    private val systemPrompt =
        """
                        ### System
                        You are a traffic anomaly analyst. Given the following geolocation and time,
                        provide a concise description of the anomaly (eg. incident, event) 
                        based on data in the internet, like news, traffic API and so on.
                        
                        ### Instructions
                        Return a concise (2-3 phrases) description of the anomaly based on the provided geolocation 
                        and time [country, municipality, streets, time].
                        You may attach links to relevant news articles or traffic reports.
                        
                        ### Context
                        Provided data is a list of country, municipality, streets and time of the anomaly, 
                        all related probably to the same event.
                        
                        ### Input
                        [Poland, Lodz, [Piotrkowska, Pilsudskiego], 2020-06-14T14:00:00]
                        [Poland, -, [Piotrkowska], 2020-06-14T15:00:00]
                        
                        ### Expected Output:
                        "On June 14, 2020, a significant traffic incident occurred in Lodz, Poland, 
                        affecting center of the city. Local news reported a major collision involving multiple vehicles, 
                        leading to road closures and delays. For more details, see [http://example.news.com]."
                    """
    private val responseFormatObject =
        ResponseFormat(
            type = "json_schema",
            json_schema =
                ResponseFormat.JsonSchemaWrapper(
                    name = "LLMLabelingResponse",
                    schema =
                        ResponseFormat.JsonSchema(
                            properties =
                                mapOf(
                                    "llmResponse" to ResponseFormat.JsonProperty(type = "string")
                                ),
                            required = listOf("llmResponse"),
                        ),
                ),
        )

    suspend fun labelUsingLLM(anomalySliceHours: List<AnomalySliceHour>): LlmLabelResponse {
        val userPrompt =
            anomalySliceHours.joinToString("\n") {
                "[${it.country}, ${it.municipality}, [${it.streets.joinToString(", ")}], ${it.time}]"
            }

        println(Json.encodeToString(responseFormatObject))

        val llmRequest =
            LLMRequest(
                model = modelId,
                messages =
                    listOf(
                        LLMRequest.Message(role = "system", content = systemPrompt),
                        LLMRequest.Message(role = "user", content = userPrompt),
                    ),
                response_format = responseFormatObject,
            )

        val response: String =
            webClient
                .post()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(llmRequest)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(String::class.java)
                .awaitSingle()


        return parseResponse(response)
    }

    private fun parseResponse(response: String): LlmLabelResponse {
        println("json response: ${Json.encodeToString(response)}")

        val json = Json { ignoreUnknownKeys = true }

        val parsed: JsonElement = json.parseToJsonElement(response)
        val content: String =
            parsed.jsonObject["choices"]
                ?.jsonArray
                ?.firstOrNull()
                ?.jsonObject["message"]
                ?.jsonObject["content"]
                ?.jsonPrimitive
                ?.contentOrNull
                ?: throw IllegalStateException("Response does not contain expected content")
        println(content)

        val innerParsed = json.parseToJsonElement(content)
        val llmResponse: String =
            innerParsed.jsonObject["llmResponse"]?.jsonPrimitive?.contentOrNull
                ?: throw IllegalStateException("LLM response does not contain 'llmResponse' field")
        println(llmResponse)

        return LlmLabelResponse(llmResponse)
    }

    @Serializable
    data class LLMRequest(
        val model: String,
        val messages: List<Message>,
        val response_format: ResponseFormat,
    ) {
        @Serializable
        data class Message(val role: String, val content: String)
    }

    @Serializable
    data class ResponseFormat(val type: String, val json_schema: JsonSchemaWrapper) {
        @Serializable
        data class JsonSchemaWrapper(val name: String, val schema: JsonSchema)

        @Serializable
        data class JsonSchema(
            val type: String = "object",
            val properties: Map<String, JsonProperty>,
            val required: List<String>,
            val additionalProperties: Boolean = false,
        )

        @Serializable
        data class JsonProperty(val type: String)
    }
}
