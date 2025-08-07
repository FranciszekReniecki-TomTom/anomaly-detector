package anomalydetector.service.labeling

import java.time.LocalDateTime
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.springframework.web.reactive.function.client.WebClient

class LlmLabelingServiceTest {
    @Test
    fun `llmLabeling should return valid response`() {
        val service = LlmLabelingService(WebClient.builder())
        val anomalySliceHours =
            listOf(
                AnomalySliceHour(
                    "Poland",
                    "Zdunska Wola",
                    listOf("Zapolice", "Paprotnia"),
                    LocalDateTime.parse("2020-06-14T14:00:00"),
                )
            )

        val response = runBlocking { service.labelUsingLLM(anomalySliceHours) }
        println(response)
    }
}
