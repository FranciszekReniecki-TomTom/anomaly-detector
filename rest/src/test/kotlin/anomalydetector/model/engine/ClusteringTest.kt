package anomalydetector.model.engine

import kotlin.test.Test
import org.junit.jupiter.api.Assertions.*

class ClusteringTest {

    @Test
    fun `single cluster of nearby points`() {
        val data =
            arrayOf(
                doubleArrayOf(0.0, 0.0, 1.0),
                doubleArrayOf(0.01, 0.0, 1.1),
                doubleArrayOf(0.02, 0.0, 0.9),
                doubleArrayOf(0.03, 0.01, 1.0),
            )

        val result = findClusters(data, minN = 2, radius = 1.0)

        assertEquals(1, result.size)
        assertEquals(setOf(0, 1, 2, 3), result[0].toSet())
    }

    @Test
    fun `two distinct clusters`() {
        val cluster1 = arrayOf(doubleArrayOf(0.0, 0.0, 0.2), doubleArrayOf(0.01, 0.0, 0.0))
        val cluster2 = arrayOf(doubleArrayOf(10.0, 10.0, 10.1), doubleArrayOf(10.01, 10.0, 10.0))
        val data = cluster1 + cluster2

        val result = findClusters(data, minN = 1, radius = 0.1)

        assertEquals(2, result.size)
        assertEquals(setOf(0, 1), result[0].toSet())
        assertEquals(setOf(2, 3), result[1].toSet())
    }

    @Test
    fun `given too big radius one cluster`() {
        val cluster1 = arrayOf(doubleArrayOf(0.0, 0.0, 0.2), doubleArrayOf(0.01, 0.0, 0.0))
        val cluster2 = arrayOf(doubleArrayOf(10.0, 10.0, 10.1), doubleArrayOf(10.01, 10.0, 10.0))
        val data = cluster1 + cluster2

        val result = findClusters(data, minN = 2, radius = 5.0)

        assertEquals(1, result.size)
        assertEquals(setOf(0, 1, 2, 3), result[0].toSet())
    }
}
