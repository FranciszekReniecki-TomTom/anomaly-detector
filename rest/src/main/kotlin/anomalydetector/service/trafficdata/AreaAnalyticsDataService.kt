package anomalydetector.service.trafficdata

import anomalydetector.model.TrafficTileHour
import com.tomtom.tti.area.analytics.io.storage.AreaAnalyticsStorage
import com.tomtom.tti.area.analytics.model.traffic.M20Traffic
import com.tomtom.tti.area.analytics.model.traffic.Traffic
import com.tomtom.tti.area.analytics.model.traffic.aggregate
import com.tomtom.tti.nida.morton.geom.MortonTileLevel
import com.tomtom.tti.nida.morton.mortonTiles
import com.tomtom.tti.nida.storage.ProcessingTile
import com.tomtom.tti.nida.storage.processingTileFromCode
import com.tomtom.tti.nida.storage.processingTiles
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.IO
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.sync.Semaphore
import kotlinx.coroutines.sync.withPermit
import org.locationtech.jts.geom.Geometry

val LEVEL: MortonTileLevel<*> = MortonTileLevel.M19
const val CONCURRENT_CALLS_LIMIT: Int = 1024

data class AASecrets(val account: String, val key: String)

class AreaAnalyticsDataService(aaSecrets: AASecrets) {
    private val storage = AreaAnalyticsStorage(aaSecrets.account, aaSecrets.key)

    suspend fun getData(
        startDay: LocalDateTime,
        endDay: LocalDateTime,
        geometry: Geometry,
    ): List<TrafficTileHour> = coroutineScope {
        val allDays: List<LocalDateTime> =
            generateSequence(startDay) { it.plusDays(1) }
                .take(ChronoUnit.DAYS.between(startDay.toLocalDate(), endDay.toLocalDate()).toInt())
                .toList()

        val processingTiles: Set<ProcessingTile> = geometry.processingTiles()

        val semaphore = Semaphore(CONCURRENT_CALLS_LIMIT)

        allDays
            .flatMap { day: LocalDateTime ->
                processingTiles.map { tile ->
                    async(Dispatchers.IO) {
                        semaphore.withPermit {
                            val trafficList = getDay(day.toLocalDate(), tile.code, geometry)
                            trafficList.map { traffic ->
                                TrafficTileHour(
                                    day.plusHours(traffic.hour.toLong()),
                                    traffic.id,
                                    traffic.traffic,
                                )
                            }
                        }
                    }
                }
            }
            .awaitAll()
            .flatten()
    }

    private suspend fun getDay(
        day: LocalDate,
        tile: Long,
        geometry: Geometry,
    ): List<AggregatedTraffic> {
        val tileCodes: List<Long> = geometry.mortonTiles(LEVEL).map { it.code }
        val processingTile = processingTileFromCode(tile)
        //    println("DayTime $day, unique tiles: ${aggregateRoads.groupBy { it.id }.size}")
        return storage.traffic
            .read(day, processingTile, LEVEL, geometry)
            .awaitAll()
            .flatten()
            .flatMap { it.m20Traffic }
            .filter { it: M20Traffic -> it.id in tileCodes }
            .aggregateRoads()
    }
}

// private fun tileToGeometry(m19code: Long): Geometry {
//    val reader: WKTReader = WKTReader()
//    val mortonTile = MortonTileLevel.M19.getTile(m19code)
//    return reader.read(mortonTile.bounds.toWKTString())
// }

private fun List<M20Traffic>.aggregateRoads(): List<AggregatedTraffic> =
    this.groupBy { (Pair(it.id, it.hour)) }
        .map { (key, group) ->
            val (id, hour) = key
            val aggregatedTraffic = group.map { it.traffic }.aggregate()
            AggregatedTraffic(id = id, hour = hour, traffic = aggregatedTraffic.rounded())
        }
        .toList()

private data class AggregatedTraffic(val id: Long, val hour: Byte, val traffic: Traffic)
