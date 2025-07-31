package anomalydetector.model.engine

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.Arguments.of
import org.junit.jupiter.params.provider.MethodSource
import java.util.stream.Stream
import kotlin.test.Test

class DetectionTest {
  companion object {
    @JvmStatic
    fun meanTestCases(): Stream<Arguments> = Stream.of(
      of(doubleArrayOf(5.0, 5.0, 5.0, 5.0), 2, doubleArrayOf(5.0, 5.0)),
      of(doubleArrayOf(1.0, 2.0, 3.0, 4.0), 2, doubleArrayOf(2.0, 3.0)),
      of(doubleArrayOf(10.0, 20.0, 30.0, 40.0, 50.0), 3, doubleArrayOf(25.0, 35.0, 30.0)),
    )

    @JvmStatic
    fun stdTestCases(): Stream<Arguments> = Stream.of(
      of(doubleArrayOf(5.0, 5.0, 5.0, 5.0), 2, doubleArrayOf(0.0, 0.0)),
      of(doubleArrayOf(1.0, 2.0, 3.0, 4.0), 2, doubleArrayOf(1.0, 1.0)),
      of(doubleArrayOf(10.0, 20.0, 30.0, 40.0, 50.0), 3, doubleArrayOf(15.0, 15.0, 0.0)),
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

    assertThrows<IllegalArgumentException> {
      calculateMeans(values, period)
    }
  }

  @Test
  fun `when values are empty throws exception`() {
    assertThrows<IllegalArgumentException> {
      calculateMeans(doubleArrayOf(), 1)
    }
  }

  @Test
  fun `when period is greater than values size throws exception`() {
    val values = doubleArrayOf(1.0, 2.0, 3.0)
    val period = 4

    assertThrows<IllegalArgumentException> {
      calculateMeans(values, period)
    }
  }

  @ParameterizedTest
  @MethodSource("stdTestCases")
  fun `test calculateStds`(values: DoubleArray, period: Int, expected: DoubleArray) {
    val result = calculateStds(values, period)
    assertArrayEquals(expected, result, 0.0001)
  }

}