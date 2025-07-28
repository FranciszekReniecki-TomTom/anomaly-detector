package com.tomtom.anomalydetector.model

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.*
import org.locationtech.jts.geom.Geometry

@Entity
data class Report(
        @Id @GeneratedValue val id: UUID? = null,
        val name: String,
        @Column(name = "creation_date") val creationDate: LocalDateTime,
        @Column(columnDefinition = "geometry") val geometry: Geometry? = null,
        @OneToMany(mappedBy = "report", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
        val clusters: List<Cluster> = emptyList()
)
