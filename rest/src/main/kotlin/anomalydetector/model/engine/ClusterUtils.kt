package anomalydetector.model.engine

import anomalydetector.model.TrafficTileHour
import kotlin.math.abs
import kotlin.math.pow
import smile.clustering.DBSCAN
import smile.data.DataFrame
import smile.data.vector.DoubleVector
import smile.feature.transform.RobustStandardizer
import smile.neighbor.KDTree
import smile.plot.swing.Canvas
import smile.plot.swing.ScatterPlot

internal fun drawAnomalies(anomalies: List<List<TrafficTileHour>>) {
    val points: Array<DoubleArray> =
        anomalies
            .withIndex()
            .map { (i, tthList) ->
                tthList
                    .map { it.geoTime() + i.toDouble() }
                    .filter { it[3] != Int.MAX_VALUE.toDouble() }
            }
            .flatten()
            .toTypedArray()

    draw3DScatter(points)
}

internal fun draw3DScatter(points: Array<DoubleArray>) {
    val df =
        DataFrame(
            DoubleVector("lat", points.map { it[0] }.toDoubleArray()),
            DoubleVector("lon", points.map { it[1] }.toDoubleArray()),
            DoubleVector("time", points.map { it[2] }.toDoubleArray()),
            DoubleVector("cluster", points.map { it[3] }.toDoubleArray()),
        )

    val canvas =
        Canvas(
            ScatterPlot.of(df, "lat", "lon", "time", "cluster", '*')
                .figure()
                .setAxisLabel(0, "Latitude")
                .setAxisLabel(1, "Longitude")
                .setAxisLabel(2, "Time")
        )
    canvas.window()
    Thread.sleep(1_000_000)
}

internal fun drawKDistances(points: Array<DoubleArray>) {
    val distances = computeKDistances(points)

    val scatterPlot =
        ScatterPlot.of(
            distances.withIndex().map { (i, d) -> doubleArrayOf(i.toDouble(), d) }.toTypedArray()
        )

    val canvas = Canvas(scatterPlot.figure())
    canvas.window()
    Thread.sleep(100_000)
}

fun computeKDistances(points: Array<DoubleArray>): DoubleArray {
    val minPts = points.first().size * 2
    val df = DataFrame.of(points)

    val scaler = RobustStandardizer.fit(df)
    val normalized: Array<DoubleArray> = scaler.apply(df).toArray()

    val tree = KDTree(normalized, normalized)

    return normalized
        .map { point ->
            val neighbors = tree.search(point, minPts)
            neighbors[minPts - 1].distance
        }
        .sorted()
        .toDoubleArray()
}

fun findBreakPoint(points: Array<DoubleArray>): Double {
    val y = computeKDistances(points)
    val x = DoubleArray(y.size) { it.toDouble() }
    val segmentSize = 5

    var breakPoint = 0
    var bestError = Double.MAX_VALUE

    for (i in segmentSize until points.size - segmentSize) {
        val leftX = x.sliceArray(0 until i)
        val leftY = y.sliceArray(0 until i)
        val rightX = x.sliceArray(i until x.size)
        val rightY = y.sliceArray(i until y.size)

        val (inter1, slope1) = simpleLinearRegression(leftX, leftY)
        val (inter2, slope2) = simpleLinearRegression(rightX, rightY)

        val leftError = mse(leftX, leftY, inter1, slope1)
        val rightError = mse(rightX, rightY, inter2, slope2)
        val totalError = leftError + rightError

        val slopeChange = abs(slope2 - slope1) / slope1
        if (slopeChange > 0.5) {
            return y[i]
        }
    }

    return y[breakPoint]
}

fun simpleLinearRegression(x: DoubleArray, y: DoubleArray): Pair<Double, Double> {
    val n = x.size
    val xMean = x.average()
    val yMean = y.average()

    val slope =
        (0 until n).sumOf { (x[it] - xMean) * (y[it] - yMean) } /
            (0 until n).sumOf { (x[it] - xMean).pow(2) }
    val intercept = yMean - slope * xMean

    return intercept to slope
}

fun mse(x: DoubleArray, y: DoubleArray, intercept: Double, slope: Double): Double {
    val errors = y.indices.map { i -> (y[i] - (slope * x[i] + intercept)).pow(2) }
    return errors.average()
}

internal fun testRadius(points: Array<DoubleArray>) {
    println("Testing different radii for clustering...")
    generateSequence(0.02) { it + 0.02 }
        .takeWhile { it < 0.6 }
        .forEach { radius ->
            val clusters = DBSCAN.fit(points, points.first().size * 2, radius)
            println(
                "Cluster with $radius: ${clusters.k()} clusters [sizes: ${clusters.size().toList()}]"
            )
        }
}
