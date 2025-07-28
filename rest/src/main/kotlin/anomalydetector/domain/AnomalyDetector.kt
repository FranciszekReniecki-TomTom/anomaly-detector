import anomalydetector.model.TileHour
import com.tomtom.tti.area.analytics.model.traffic.Traffic

class AnomalyDetector (){
    fun getAnomalies(tileHours: List<TileHour>) :List<TileHour>{
        val weekAverageTileHours = getWeekAverage(tileHours)
    }

    private fun getWeekAverage(tileHours: List<TileHour>): List<TileHour>{
        val averagedList: List<TileHour> = tileHours
            .groupBy { Pair(it.date, it.hour) }
            .map { (dateHour, list) ->
                val avgSpeed = list.map { it.traffic.speedKmH }.average()
                val avgDistance = list.map { it.traffic.totalDistanceM }.average().toLong()
                val avgFreeFlowSpeed = list.map { it.traffic.freeFlowSpeedKmH }.average()

                TileHour(
                    date = dateHour.first,
                    hour = dateHour.second,
                    id = list.first().id,
                    traffic = Traffic(
                        totalDistanceM = avgDistance,
                        speedKmH = avgSpeed,
                        freeFlowSpeedKmH = avgFreeFlowSpeed
                    )
                )
            }
    }
}