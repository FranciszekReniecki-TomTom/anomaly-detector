package anomalydetector.model.detection

import anomalydetector.model.TrafficTileHour
import anomalydetector.model.ingest.getData
import anomalydetector.model.stringify
import com.tomtom.tti.area.analytics.model.traffic.Traffic
import com.tomtom.tti.nida.morton.geom.MortonTileLevel
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.Geometry
import org.locationtech.jts.geom.GeometryFactory
import java.nio.file.Files
import java.nio.file.Path
import java.time.DayOfWeek
import java.time.LocalDate.of

class OutlierDetectionTest {
  private val trafficTileHour: TrafficTileHour =
    TrafficTileHour(
      of(2024, 1, 1),
      0,
      123,
      Traffic(100L, 50.0, 150.0)
    )

  private val trafficTileHourOutlier: TrafficTileHour =
    trafficTileHour.copy(traffic = Traffic(200L, 100.0, 300.0))

  private val lodzCenter: Geometry = GeometryFactory().createPolygon(
    arrayOf(
      Coordinate(19.38596573135959, 51.82078502699909),
      Coordinate(19.38596573135959, 51.71384922586617),
      Coordinate(19.535055695874632, 51.71384922586617),
      Coordinate(19.535055695874632, 51.82078502699909),
      Coordinate(19.38596573135959, 51.82078502699909),
    )
  )

  @Test
  fun `when outlier return it`() {
    val outliers = findOutliersInSpeed(
      List(100) { trafficTileHour } + trafficTileHourOutlier,
      1.5
    )

    assertEquals(1, outliers.size, "There should be one outlier detected")
    assertEquals(
      outliers.first(), trafficTileHourOutlier,
      "The detected outlier should match the expected outlier"
    )
  }

  @Test
  fun `when no outlier return empty list`() {
    val noOutliers = findOutliersInSpeed(
      List(100) { trafficTileHour }, 1.5
    )

    assertTrue(noOutliers.isEmpty(), "There should be no outliers detected")
  }

  @Test
  fun `test on real data`() {
    val marker = Triple(DayOfWeek.MONDAY, 0.toByte(), 14734302L)
    val data: List<TrafficTileHour> = getData(
      of(2024, 1, 1),
      365,
      3597,
      MortonTileLevel.M12,
      lodzCenter
    )

    val outliers = findOutliersInSpeed(
      data,
      4.0
    )

    println("===============================")
    println("data size: ${data.size}")
    println("outliers size: ${outliers.size}")
    println("===============================")

    Files.write(Path.of("outliers.txt"), outliers.map { it.stringify() })
  }
}