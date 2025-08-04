package anomalydetector.service.llm

import anomalydetector.service.AnomalySliceHour
import org.springframework.stereotype.Service

@Service
class LLMLabelingService {
    fun labelUsingLLM(anomalySliceHours: List<AnomalySliceHour>): String {

        return "dupa"
    }
}