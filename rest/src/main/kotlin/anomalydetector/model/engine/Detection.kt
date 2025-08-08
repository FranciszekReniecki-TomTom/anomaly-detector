package anomalydetector.model.engine

import kotlin.math.abs
import kotlin.math.sqrt

/** Week period constant representing the number of hours in a week. */
private const val WEEK_PERIOD = 168

/**
 * Given an array of weekly periodic values (with an hourly step), finds outliers indexes.
 *
 * @param values Array of periodic values, e.g., traffic data for a week, month, year.
 * @param threshold The threshold for determining an outlier based on Z-score.
 * @return An array of indices of the outliers in the input array.
 */
fun findWeeklyOutliers(values: DoubleArray, threshold: Double): IntArray {
    val period = WEEK_PERIOD
    val means = calculateMeans(values, period)
    val stds = calculateStds(values, means, period)

    val outliers = mutableListOf<Int>()
    for (i in values.indices) {
        val hourIndex = i % period
        val mean = means[hourIndex]
        val std = stds[hourIndex]
        if (std > 0.0 && abs(values[i] - mean) / std > threshold) {
            outliers.add(i)
        }
    }
    return outliers.toIntArray()
}

fun calculateMeans(values: DoubleArray, period: Int): DoubleArray {
    require(values.isNotEmpty()) { "Values array must not be empty." }
    require(period > 0) { "Period must be greater than 0." }

    return DoubleArray(period) { index ->
        var sum = 0.0
        var count = 0
        for (i in values.indices) {
            if (i % period == index) {
                val v = values[i]
                if (!v.isNaN()) {
                    sum += v
                    count++
                }
            }
        }
        if (count > 0) sum / count else Double.NaN
    }
}

fun calculateStds(values: DoubleArray, means: DoubleArray, period: Int): DoubleArray {
    require(values.isNotEmpty()) { "Values array must not be empty." }
    require(period > 0) { "Period must be greater than 0." }

    return DoubleArray(period) { index ->
        var sumOfSquares = 0.0
        for (i in values.indices) {
            if (i % period == index) {
                val v = values[i]
                if (!v.isNaN()) {
                    sumOfSquares += (v - means[index]) * (v - means[index])
                }
            }
        }

        var count = 0
        for (i in values.indices) {
            val idx = i % period
            if (idx == index && !values[i].isNaN()) count++
        }

        sqrt(sumOfSquares / count).takeIf { count > 0 } ?: 0.0
    }
}
