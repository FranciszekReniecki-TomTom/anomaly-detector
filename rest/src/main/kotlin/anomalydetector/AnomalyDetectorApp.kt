package anomalydetector

import org.springframework.boot.autoconfigure.SpringBootApplication

@SpringBootApplication
class AnomalyDetectorApp

fun main(args: Array<String>) {
    org.springframework.boot.runApplication<AnomalyDetectorApp>(*args)
}