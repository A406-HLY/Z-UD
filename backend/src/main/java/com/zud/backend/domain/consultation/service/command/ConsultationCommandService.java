package com.zud.backend.domain.consultation.service.command;

import com.zud.backend.domain.consultation.entity.Consultation;

public interface ConsultationCommandService {
	Consultation save(final Consultation consultation);
}
