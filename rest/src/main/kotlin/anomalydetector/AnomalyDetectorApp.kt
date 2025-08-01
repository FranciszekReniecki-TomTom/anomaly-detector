package anomalydetector

import org.springframework.boot.autoconfigure.SpringBootApplication

@SpringBootApplication open class AnomalyDetectorApp

fun main(args: Array<String>) {
    org.springframework.boot.runApplication<AnomalyDetectorApp>(*args)
}
