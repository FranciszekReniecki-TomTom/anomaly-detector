package anomalydetector.service.trafficdata

import org.junit.jupiter.api.Assertions.*

class AreaAnalyticsDataServiceTest {
    //  private val lodzCenter: Geometry = GeometryFactory().createPolygon(
    //    arrayOf(
    //      Coordinate(19.38596573135959, 51.82078502699909),
    //      Coordinate(19.38596573135959, 51.71384922586617),
    //      Coordinate(19.535055695874632, 51.71384922586617),
    //      Coordinate(19.535055695874632, 51.82078502699909),
    //      Coordinate(19.38596573135959, 51.82078502699909),
    //    )
    //  )

    //  @Test
    //  fun `get data for 1 day`() {
    //    val data = getData(
    //      LocalDate.of(2024, 1, 1),
    //      1,
    //      3597,
    //      MortonTileLevel.M16,
    //      lodzCenter
    //    )
    //
    //    assertTrue(data.isNotEmpty(), "Data should not be empty")
    //
    //    data.sortedBy { it.date }
    //    assertTrue { data.first().date == LocalDate.of(2024, 1, 1) }
    //    assertTrue { data.last().date == LocalDate.of(2024, 1, 1) }
    //
    //    assertTrue(data.groupBy { it.mortonTileId }.isNotEmpty())
    //    assertEquals(1, data.groupBy { it.date }.size)
    //    assertEquals(24, data.groupBy { it.hour }.size)
    //  }

}
