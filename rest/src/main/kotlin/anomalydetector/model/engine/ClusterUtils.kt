package anomalydetector.model.engine

import anomalydetector.model.TrafficTileHour
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

    val window = canvas.window()
    window.defaultCloseOperation = javax.swing.JFrame.EXIT_ON_CLOSE
}

internal fun drawKDistances(points: Array<DoubleArray>) {
    val distances: List<Double> = computeKDistances(points)

    val scatterPlot =
        ScatterPlot.of(
            distances.withIndex().map { (i, d) -> doubleArrayOf(i.toDouble(), d) }.toTypedArray()
        )

    val canvas = Canvas(scatterPlot.figure())
    val window = canvas.window()
    window.defaultCloseOperation = javax.swing.JFrame.EXIT_ON_CLOSE
}

internal fun computeKDistances(points: Array<DoubleArray>): List<Double> {
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
