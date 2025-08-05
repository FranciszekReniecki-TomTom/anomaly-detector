package anomalydetector.model.engine

import org.jetbrains.kotlinx.serialization.compiler.backend.jvm.DOUBLE
import java.util.stream.Stream
import kotlin.test.Test
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.Arguments.of
import org.junit.jupiter.params.provider.MethodSource
import kotlin.Double.Companion.NaN

class DetectionTest {
    companion object {
        @JvmStatic
        fun meanTestCases(): Stream<Arguments> =
            Stream.of(
                of(doubleArrayOf(5.0, 5.0, 5.0, 5.0), 2, doubleArrayOf(5.0, 5.0)),
                of(doubleArrayOf(1.0, 2.0, 3.0, 4.0), 2, doubleArrayOf(2.0, 3.0)),
                of(doubleArrayOf(10.0, 20.0, 30.0, 40.0, 50.0), 3, doubleArrayOf(25.0, 35.0, 30.0)),
            )

        @JvmStatic
        fun stdTestCases(): Stream<Arguments> =
            Stream.of(
                of(
                    doubleArrayOf(5.0, 5.0, 5.0, 5.0),
                    doubleArrayOf(5.0, 5.0),
                    2,
                    doubleArrayOf(0.0, 0.0),
                ),
                of(
                    doubleArrayOf(1.0, 2.0, 3.0, 4.0),
                    doubleArrayOf(2.0, 3.0),
                    2,
                    doubleArrayOf(1.0, 1.0),
                ),
                of(
                    doubleArrayOf(10.0, 20.0, 30.0, 40.0, 50.0),
                    doubleArrayOf(25.0, 35.0, 30.0),
                    3,
                    doubleArrayOf(15.0, 15.0, 0.0),
                ),
            )
    }

    @ParameterizedTest
    @MethodSource("meanTestCases")
    fun `test calculateMeans`(values: DoubleArray, period: Int, expected: DoubleArray) {
        val result = calculateMeans(values, period)
        assertArrayEquals(expected, result, 0.0001)
    }

    @Test
    fun `when period is zero throws exception`() {
        val values = doubleArrayOf(1.0, 2.0, 3.0)
        val period = 0

        assertThrows<IllegalArgumentException> { calculateMeans(values, period) }
    }

    @Test
    fun `when values are empty throws exception`() {
        assertThrows<IllegalArgumentException> { calculateMeans(doubleArrayOf(), 1) }
    }

    @Test
    fun `when period is greater than values size throws exception`() {
        val values = doubleArrayOf(1.0, 2.0, 3.0)
        val period = 4

        assertThrows<IllegalArgumentException> { calculateMeans(values, period) }
    }

    @ParameterizedTest
    @MethodSource("stdTestCases")
    fun `test calculateStds`(
        values: DoubleArray,
        means: DoubleArray,
        period: Int,
        expected: DoubleArray,
    ) {
        val result = calculateStds(values, means, period)
        assertArrayEquals(expected, result, 0.0001)
    }

    @Test
    fun `should ignore NaN values in means calculation`() {
        val values = doubleArrayOf(1.0, NaN, 3.0, 4.0)
        val period = 2
        val expected = doubleArrayOf(2.0, 4.0)

        val result = calculateMeans(values, period)
        assertArrayEquals(expected, result, 0.0001)
    }

    @Test
    fun `should ignore NaN values in stds calculation`() {
        val values = doubleArrayOf(1.0, NaN, 3.0, 4.0)
        val means = doubleArrayOf(2.0, 4.0)
        val period = 2
        val expected = doubleArrayOf(1.0, 0.0)

        val result = calculateStds(values, means, period)
        assertArrayEquals(expected, result, 0.0001)
    }

    @Test
    fun `should ignore NaN in period greater than values size`() {
        val values = doubleArrayOf(1.0, 2.0, 3.0, 4.0, NaN)
        val period = 5
        val expected = doubleArrayOf(1.0, 2.0, 3.0, 4.0, NaN)

        val result = calculateMeans(values, period)
        assertArrayEquals(expected, result, 0.0001)
    }

    @Test
    fun `should ignore NaN in stds calculation with period greater than values size`() {
        val values = doubleArrayOf(1.0, 2.0, 3.0, 4.0, NaN)
        val means = doubleArrayOf(2.0, 3.0, 4.0, 5.0, NaN)
        val period = 5
        val expected = doubleArrayOf(1.0, 1.0, 1.0, 1.0, 0.0)

        val result = calculateStds(values, means, period)
        assertArrayEquals(expected, result, 0.0001)
    }

    @Test
    fun `test findWeeklyOutliers with NaN in data`() {
        val values = doubleArrayOf(3.0) + DoubleArray(167) { NaN } +
                doubleArrayOf(3.0) + DoubleArray(167) { NaN } +
                doubleArrayOf(3.0) + DoubleArray(167) { NaN } +
                doubleArrayOf(1.0) + DoubleArray(167) { NaN }
        val threshold = 1.0
        val expectedOutliers = intArrayOf(168 + 168 + 168 + 0)

        val outliers = findWeeklyOutliers(values, threshold)
        assertArrayEquals(expectedOutliers, outliers)
    }
}
