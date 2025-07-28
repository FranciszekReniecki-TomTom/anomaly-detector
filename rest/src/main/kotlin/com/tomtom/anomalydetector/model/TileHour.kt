package com.tomtom.anomalydetector.model

import jakarta.persistence.*
import java.io.Serializable
import java.time.LocalDate
import java.util.*

@Embeddable
data class TileHourId(val tileId: Long = 0, val date: LocalDate = LocalDate.now()) : Serializable

@Entity
data class TileHour(
        @EmbeddedId val id: TileHourId,
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "cluster_id")
        val cluster: Cluster? = null
)
