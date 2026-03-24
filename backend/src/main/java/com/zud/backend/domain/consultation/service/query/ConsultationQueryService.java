package com.zud.backend.domain.consultation.service.query;

import com.zud.backend.domain.consultation.entity.Consultation;

public interface ConsultationQueryService {
	Consultation findById(final Long consultationId);

	Consultation findByUuid(String uuid);
}
