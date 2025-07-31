package anomalydetector.model.detection

import anomalydetector.model.TrafficTileHour
import com.tomtom.tti.area.analytics.model.traffic.Traffic
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
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

  @Test
  fun `when outlier return it`() {
    val outliers = findOutliers(
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
    val noOutliers = findOutliers(
      List(100) { trafficTileHour }, 1.5
    )

    assertTrue(noOutliers.isEmpty(), "There should be no outliers detected")
  }

}