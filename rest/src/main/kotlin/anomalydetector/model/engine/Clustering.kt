package anomalydetector.model.engine

import smile.clustering.DBSCAN
import smile.data.DataFrame
import smile.feature.transform.RobustStandardizer
import smile.math.distance.EuclideanDistance
import smile.neighbor.KDTree
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.sqrt

/**
 * Given n-dimensional space of points finds their clusters.
 *
 * @param dataPoints Array of data points, representing dimensions.
 * @param minN Minimum number of points in a cluster.
 * @param radius Radius for the DBSCAN clustering algorithm.
 * @return List of clusters, where each cluster is a list of indices of outliers.
 */
fun findClusters(
    dataPoints: Array<DoubleArray>,
    minN: Int = dataPoints.first().size,
    radius: Double,
    noise: Boolean = true,
): List<List<Int>> {
    val df = DataFrame.of(dataPoints)
    val scaler = RobustStandardizer.fit(df)
    val normalized = scaler.apply(df).toArray()

    val kDistances = computeKDistances(normalized, minN)
    val optimalRadius = findKneePoint(kDistances)
    println("Optimal radius: $optimalRadius")

    val clusters = DBSCAN.fit(normalized, EuclideanDistance(), minN, optimalRadius)

    return dataPoints
        .withIndex()
        .map { (dataPointIndex, _) -> dataPointIndex to clusters.group()[dataPointIndex] }
        .groupBy({ it.second }, { it.first })
        .filter { noise || it.key != Int.MAX_VALUE }
        .values
        .toList()
}

fun computeKDistances(normalized: Array<DoubleArray>, minN: Int): DoubleArray {
    val tree = KDTree(normalized, normalized)

    return normalized
        .map { point ->
            val neighbors = tree.search(point, minN)
            neighbors[minN - 1].distance
        }
        .sorted()
        .toDoubleArray()
}

fun findKneePoint(y: DoubleArray): Double {
    if (y.size < 3) return y.last()

    val x = DoubleArray(y.size) { it.toDouble() }

    val xMin = x.first()
    val xMax = x.last()
    val yMin = y.minOrNull()!!
    val yMax = y.maxOrNull()!!

    val dx = xMax - xMin
    val dy = yMax - yMin

    if (dx == 0.0 || dy == 0.0) return y.first() // brak zróżnicowania

    // Wektor od pierwszego do ostatniego punktu
    val lineVecX = 1.0 // po normalizacji x
    val lineVecY = 1.0 // po normalizacji y

    var maxDist = 0.0
    var kneeIndex = 0

    for (i in 1 until y.lastIndex) {
        val xNorm = (x[i] - xMin) / dx
        val yNorm = (y[i] - yMin) / dy

        // odległość punktu od linii (0,0) → (1,1)
        val area = abs(xNorm * lineVecY - yNorm * lineVecX)
        val dist = area / sqrt(lineVecX * lineVecX + lineVecY * lineVecY)

        if (dist > maxDist) {
            maxDist = dist
            kneeIndex = i
        }
    }

    return y[kneeIndex]
}

