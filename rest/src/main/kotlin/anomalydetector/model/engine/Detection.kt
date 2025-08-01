package anomalydetector.model.engine

import kotlin.math.abs
import kotlin.math.sqrt

/** Week period constant representing the number of hours in a week. */
private const val weekPeriod = 168

/**
 * Given an array of weekly periodic values (with an hourly step), finds outliers indexes.
 *
 * @param values Array of periodic values, e.g., traffic data for a week.
 * @param threshold The threshold for determining an outlier based on Z-score.
 * @return An array of indices of the outliers in the input array.
 */
fun findWeeklyOutliers(values: DoubleArray, threshold: Double): IntArray {
    val means = calculateMeans(values, weekPeriod)
    val stds = calculateStds(values, means, weekPeriod)

    return values
        .withIndex()
        .filter { (index, value) ->
            val hourIndex = index % weekPeriod
            val mean = means[hourIndex]
            val std = stds[hourIndex]
            abs(value - mean) / std > threshold
        }
        .map { it.index }
        .toIntArray()
}

fun calculateMeans(values: DoubleArray, period: Int): DoubleArray {
    require(values.isNotEmpty()) { "Values array must not be empty." }
    require(period > 0 && period <= values.size) {
        "Period must be greater than 0 and less than or equal to the size of values."
    }

    return DoubleArray(period) { index ->
        val filtered = values.withIndex().filter { it.index % period == index }.map { it.value }

        filtered.average()
    }
}

fun calculateStds(values: DoubleArray, means: DoubleArray, period: Int): DoubleArray {
    require(values.isNotEmpty()) { "Values array must not be empty." }
    require(period > 0) {
        "Period must be greater than 0 and less than or equal to the size of values."
    }

    return DoubleArray(period) { index ->
        val mean = means[index]
        val sumOfSquares =
            values
                .mapIndexed { i, value ->
                    if (i % period == index) (value - mean) * (value - mean) else 0.0
                }
                .sum()
        sqrt(sumOfSquares / values.withIndex().count { (i, _) -> i % period == index })
    }
}
