package com.zud.backend.domain.consultation.service.command;

import com.zud.backend.domain.consultation.entity.Consultation;
import com.zud.backend.domain.consultation.entity.ConsultationTransfer;

public interface ConsultationCommandService {
	Consultation save(final Consultation consultation);

	void saveTransfer(final ConsultationTransfer transfer);
}
