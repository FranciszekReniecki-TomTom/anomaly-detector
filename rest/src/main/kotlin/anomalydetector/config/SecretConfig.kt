package anomalydetector.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "secrets")
@Configuration
class SecretConfig {
    lateinit var aaAccount: String
    lateinit var aaKey: String

    lateinit var ttReverseKey: String

    lateinit var groqKey: String
}
