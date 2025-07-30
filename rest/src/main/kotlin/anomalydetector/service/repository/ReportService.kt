package anomalydetector.service.repository

import anomalydetector.repository.ReportRepository
import anomalydetector.repository.model.Cluster
import anomalydetector.repository.model.GeomHour
import anomalydetector.repository.model.Report
import com.tomtom.tti.nida.morton.geom.MortonTileLevel
import com.tomtom.tti.nida.morton.geometry
import org.locationtech.jts.geom.Geometry
import java.time.LocalDateTime
import org.locationtech.jts.geom.Polygon
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.temporal.ChronoUnit

data class TiloHour(
    val mortonTile19Id: Long,
    val time: LocalDateTime)

@Service
class ReportService(private val reportRepository: ReportRepository) {

    @Transactional
    fun createReport(
        reportName: String,
        geometryChosenByUser: Polygon,
        creationDate: LocalDateTime,
        clusteredTiles: List<List<TiloHour>>
    ): Report {
        return reportRepository.save(
            Report(
                name = reportName,
                creationDate = creationDate,
                geometry = geometryChosenByUser,
                clusters = clusteredTiles.map { clusterOfTiles ->
                    Cluster( geomHours = combineClusteredTilesIntoGeometries(clusterOfTiles))
                }
            )
        )
    }
}

private fun combineClusteredTilesIntoGeometries(clusterOfTiles: List<TiloHour>) = clusterOfTiles.groupBy {
    it.time.truncatedTo(ChronoUnit.HOURS)}
    .map { (hour, tilesInGivenHour) ->
        val combinedGeometryOfTiles: Geometry =
            tilesInGivenHour.map { (mortonTile19Id, _) ->
                MortonTileLevel.M19.getTile(mortonTile19Id).geometry() }
                .reduce { acc, geometry ->
                    if (acc.isEmpty) geometry else acc.union(geometry)
            }
        GeomHour(
            timestamp = hour,
            geometry = when (combinedGeometryOfTiles) {
                is Polygon -> combinedGeometryOfTiles
                else -> error("Expected Polygon, but got : ${combinedGeometryOfTiles.geometryType}")
            }
    )
}
