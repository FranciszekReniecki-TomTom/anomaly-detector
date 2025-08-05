package anomalydetector.model.engine

import anomalydetector.model.TrafficTileHour
import anomalydetector.service.trafficdata.getData
import com.tomtom.tti.nida.morton.geom.MortonTileLevel
import java.time.LocalDate
import org.junit.jupiter.api.Test
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.Geometry
import org.locationtech.jts.geom.GeometryFactory

class EnginePlots {
    private val lodzCenter: Geometry =
        GeometryFactory()
            .createPolygon(
                arrayOf(
                    Coordinate(19.4484, 51.7871),
                    Coordinate(19.4885, 51.7825),
                    Coordinate(19.4935, 51.7482),
                    Coordinate(19.489, 51.7328),
                    Coordinate(19.4536, 51.7325),
                    Coordinate(19.4374, 51.7565),
                    Coordinate(19.4275, 51.7811),
                    Coordinate(19.4484, 51.7871),
                )
            )

    @Test
    fun `test drawAnomalies`() {
        val data = getData(LocalDate.of(2024, 1, 1), 31, 3597L, MortonTileLevel.M19, lodzCenter)

        println("Data size: ${data.size}")

        val tiles: Map<Long, List<TrafficTileHour>> = data.groupBy { it.id }

        println("Tiles size: ${tiles.size}")

        val trafficOutliers: List<TrafficTileHour> =
            tiles
                .map { (_, traffics) ->
                    val speeds = traffics.map { it.traffic.speedKmH }.toDoubleArray()
                    findWeeklyOutliers(speeds, 2.0).map { traffics[it] }
                }
                .flatten()
                .toList()

        println("Outliers size: ${trafficOutliers.size}")

        val outliers: Array<DoubleArray> = trafficOutliers.map { it.geoTime() }.toTypedArray()

        //        println("breakpoint: ${findBreakPoint(outliers)}")
        //        drawKDistances(outliers)

        val trafficClusters: List<List<TrafficTileHour>> =
            findClusters(outliers, radius = 0.2, noise = false).map { cluster ->
                cluster.map { trafficOutliers[it] }
            }

        println("Clusters size: ${trafficClusters.size}")

        val clustersWithIndex =
            trafficClusters
                .withIndex()
                .map { (index, cluster) -> cluster.map { it.geoTime() + index.toDouble() } }
                .flatten()
                .toTypedArray()

        draw3DScatter(clustersWithIndex)
    }
}
