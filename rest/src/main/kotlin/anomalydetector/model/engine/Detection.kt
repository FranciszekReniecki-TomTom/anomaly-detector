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

    return values
        .withIndex()
        .filter { (index, value) ->
            val hourIndex = index % period
            val mean = means[hourIndex]
            val std = stds[hourIndex]
            std > 0.0 && abs(value - mean) / std > threshold
        }
        .map { it.index }
        .toIntArray()
}

fun calculateMeans(values: DoubleArray, period: Int): DoubleArray {
    require(values.isNotEmpty()) { "Values array must not be empty." }
    require(period > 0) { "Period must be greater than 0." }

    return DoubleArray(period) { index ->
        val filtered =
            values
                .withIndex()
                .filter { it.index % period == index && !it.value.isNaN() }
                .map { it.value }

        filtered.average()
    }
}

fun calculateStds(values: DoubleArray, means: DoubleArray, period: Int): DoubleArray {
    require(values.isNotEmpty()) { "Values array must not be empty." }
    require(period > 0) { "Period must be greater than 0." }

    return DoubleArray(period) { index ->
        val mean = means[index]
        val sumOfSquares =
            values
                .mapIndexed { i, value ->
                    if (i % period == index && !value.isNaN()) (value - mean) * (value - mean)
                    else 0.0
                }
                .sum()
        sqrt(sumOfSquares / values.withIndex().count { (i, _) -> i % period == index })
    }
}
