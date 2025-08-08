package anomalydetector.service.labeling

import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test

class ReverseGeoCodeServiceTest(private val service: ReverseGeoCodeService) {
    @Test
    fun `reverseGeocode should return valid response`() {
        // Given
        val lat = 51.759118
        val lon = 19.455858

        // When
        val response = runBlocking { service.reverseGeocode(lat, lon) }

        println(response)
    }
}
