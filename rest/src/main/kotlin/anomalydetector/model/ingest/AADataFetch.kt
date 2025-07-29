package anomalydetector.model.ingest

import anomalydetector.model.TrafficTileHour
import com.tomtom.tti.area.analytics.io.storage.AreaAnalyticsStorage
import com.tomtom.tti.area.analytics.model.traffic.M20Traffic
import com.tomtom.tti.area.analytics.model.traffic.Traffic
import com.tomtom.tti.area.analytics.model.traffic.aggregate
import com.tomtom.tti.nida.morton.geom.MortonTileLevel
import com.tomtom.tti.nida.storage.processingTileFromCode
import io.github.cdimascio.dotenv.Dotenv
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.runBlocking
import org.locationtech.jts.geom.Geometry
import java.time.LocalDate

private val storage = AreaAnalyticsStorage(
  account = Dotenv.load()["AREA_ANALYTICS_ACCOUNT_NAME"],
  key = Dotenv.load()["AREA_ANALYTICS_KEY"],
)

fun getData(
  startDay: LocalDate,
  days: Int,
  tile: Long,
  level: MortonTileLevel<*>,
  geometry: Geometry
): List<TrafficTileHour> = runBlocking {
  generateSequence(startDay) { it.plusDays(1) }
    .take(days)
    .map { day ->
      async(Dispatchers.Default) {
        day to getDay(day, tile, level, geometry)
      }
    }
    .toList()
    .awaitAll()
    .flatMap { (date, trafficList) ->
      trafficList.map { traffic ->
        TrafficTileHour(date, traffic.hour, traffic.id, traffic.traffic)
      }
    }
}

private suspend fun getDay(
  day: LocalDate,
  tile: Long = 3597,
  level: MortonTileLevel<*> = MortonTileLevel.M16,
  geometry: Geometry
): List<AggregatedTraffic> = storage.traffic
  .read(day, processingTileFromCode(tile), level, geometry)
  .awaitAll()
  .flatten()
  .flatMap { it.m20Traffic }
  .aggregateRoads()

private fun List<M20Traffic>.aggregateRoads(): List<AggregatedTraffic> = this
  .groupBy { (Pair(it.id, it.hour)) }
  .map { (key, group) ->
    val (id, hour) = key
    val aggregatedTraffic = group.map { it.traffic }.aggregate()
    AggregatedTraffic(
      id = id,
      hour = hour,
      traffic = aggregatedTraffic.rounded()
    )
  }
  .toList()

private data class AggregatedTraffic(
  val id: Long,
  val hour: Byte,
  val traffic: Traffic
)


