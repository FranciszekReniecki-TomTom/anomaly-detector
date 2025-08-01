package anomalydetector.service.trafficdata

import com.tomtom.tti.nida.morton.geom.MortonTileLevel
import java.time.LocalDate
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.Geometry
import org.locationtech.jts.geom.GeometryFactory

class AreaAnalyticsDataServiceTest {
    private val lodzCenter: Geometry =
        GeometryFactory()
            .createPolygon(
                arrayOf(
                    Coordinate(19.38596573135959, 51.82078502699909),
                    Coordinate(19.38596573135959, 51.71384922586617),
                    Coordinate(19.535055695874632, 51.71384922586617),
                    Coordinate(19.535055695874632, 51.82078502699909),
                    Coordinate(19.38596573135959, 51.82078502699909),
                )
            )

    @Test
    fun `get data for 1 day`() {
        val data = getData(LocalDate.of(2024, 1, 1), 1, 3597, MortonTileLevel.M16, lodzCenter)

        assertTrue(data.isNotEmpty(), "Data should not be empty")

        data.sortedBy { it.datetime }
        assertTrue { data.first().datetime.toLocalDate() == LocalDate.of(2024, 1, 1) }
        assertTrue { data.last().datetime.toLocalDate() == LocalDate.of(2024, 1, 1) }

        assertTrue(data.groupBy { it.id }.isNotEmpty())
        assertEquals(1, data.groupBy { it.datetime.dayOfYear }.size)
        assertEquals(24, data.groupBy { it.datetime.hour }.size)
    }
}
