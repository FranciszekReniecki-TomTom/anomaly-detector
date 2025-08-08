package anomalydetector.config

import anomalydetector.service.AnomalyService
import anomalydetector.service.labeling.LlmLabelingService
import anomalydetector.service.labeling.ReverseGeoCodeService
import anomalydetector.service.trafficdata.AASecrets
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.function.client.WebClient

@Configuration
class AppConfig(private val secretConfig: SecretConfig) {
    @Bean
    fun anomalyService(): AnomalyService {
        return AnomalyService(
            aaSecrets = AASecrets(secretConfig.aaAccount, secretConfig.aaKey),
            reverseGeoCodeService = reverseGeoCodeService(),
            llmLabelingService = llmLabelingService(),
        )
    }

    @Bean
    fun reverseGeoCodeService(): ReverseGeoCodeService {
        return ReverseGeoCodeService(secretConfig.ttReverseKey, WebClient.builder())
    }

    @Bean
    fun llmLabelingService(): LlmLabelingService {
        return LlmLabelingService(secretConfig.groqKey, WebClient.builder())
    }
}
