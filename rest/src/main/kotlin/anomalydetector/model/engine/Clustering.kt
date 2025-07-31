package anomalydetector.model.engine

import smile.clustering.DBSCAN
import smile.data.DataFrame
import smile.feature.transform.RobustStandardizer
import smile.math.distance.EuclideanDistance

/**
 * Given n-dimensional space of points finds their clusters.
 * @param dataPoints Array of data points, representing dimensions.
 * @param minN Minimum number of points in a cluster.
 * @param radius Radius for the DBSCAN clustering algorithm.
 * @return List of clusters, where each cluster is a list of indices of outliers.
 */
fun findClusters(
  dataPoints: Array<DoubleArray>,
  minN: Int = dataPoints.first().size * 2,
  radius: Double = 0.1
): List<List<Int>> {
  val df = DataFrame.of(dataPoints)

  val scaler = RobustStandardizer.fit(df)
  val normalized = scaler.apply(df).toArray()

  val clusters = DBSCAN.fit(
    normalized, EuclideanDistance(), minN, radius
  )

  return dataPoints
    .withIndex()
    .map { (dataPointIndex, _) -> dataPointIndex to clusters.group()[dataPointIndex] }
    .groupBy({ it.second }, { it.first })
    .values
    .toList()
}