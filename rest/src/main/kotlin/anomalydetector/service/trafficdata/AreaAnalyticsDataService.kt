package anomalydetector.service.trafficdata

import anomalydetector.model.TrafficTileHour
import com.tomtom.tti.area.analytics.io.storage.AreaAnalyticsStorage
import com.tomtom.tti.area.analytics.model.traffic.M20Traffic
import com.tomtom.tti.area.analytics.model.traffic.Traffic
import com.tomtom.tti.area.analytics.model.traffic.aggregate
import com.tomtom.tti.nida.morton.geom.MortonTileLevel
import com.tomtom.tti.nida.storage.ProcessingTile
import com.tomtom.tti.nida.storage.processingTileFromCode
import com.tomtom.tti.nida.storage.processingTiles
import io.github.cdimascio.dotenv.Dotenv
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.runBlocking
import org.locationtech.jts.geom.Geometry

val level: MortonTileLevel<*> = MortonTileLevel.M19

private val storage =
    AreaAnalyticsStorage(
        account = Dotenv.load()["AREA_ANALYTICS_ACCOUNT_NAME"],
        key = Dotenv.load()["AREA_ANALYTICS_KEY"],
    )

fun getData(
    startDay: LocalDateTime,
    endDay: LocalDateTime,
    geometry: Geometry,
): List<TrafficTileHour> = runBlocking {
    generateSequence(startDay) { it.plusDays(1) }
        .take(ChronoUnit.DAYS.between(startDay.toLocalDate(), endDay.toLocalDate()).toInt())
        .map { day: LocalDateTime ->
            val processingTiles: Set<ProcessingTile> = geometry.processingTiles()
            async(Dispatchers.Default) {
                val deferredList =
                    processingTiles.map { tile ->
                        async(Dispatchers.Default) {
                            getDay(day.toLocalDate(), tile.code, level, geometry = geometry)
                        }
                    }

                day to deferredList.awaitAll().flatten()
            }
        }
        .toList()
        .awaitAll()
        .flatMap { (date: LocalDateTime, trafficList: List<AggregatedTraffic>) ->
            trafficList.map { traffic: AggregatedTraffic ->
                TrafficTileHour(date.plusHours(traffic.hour.toLong()), traffic.id, traffic.traffic)
            }
        }
}

private suspend fun getDay(
    day: LocalDate,
    tile: Long = 3597,
    level: MortonTileLevel<*>,
    geometry: Geometry?,
): List<AggregatedTraffic> {
    return storage.traffic
        .read(day, processingTileFromCode(tile), level, geometry)
        .awaitAll()
        .flatten()
        .flatMap { it.m20Traffic }
        .aggregateRoads()
}

private fun List<M20Traffic>.aggregateRoads(): List<AggregatedTraffic> =
    this.groupBy { (Pair(it.id, it.hour)) }
        .map { (key, group) ->
            val (id, hour) = key
            val aggregatedTraffic = group.map { it.traffic }.aggregate()
            AggregatedTraffic(id = id, hour = hour, traffic = aggregatedTraffic.rounded())
        }
        .toList()

private data class AggregatedTraffic(val id: Long, val hour: Byte, val traffic: Traffic)
