package com.tomtom.anomalydetector.repository

import com.tomtom.anomalydetector.model.TileHour
import com.tomtom.anomalydetector.model.TileHourId
import org.springframework.data.jpa.repository.JpaRepository

interface TileHourRepository : JpaRepository<TileHour, TileHourId>
