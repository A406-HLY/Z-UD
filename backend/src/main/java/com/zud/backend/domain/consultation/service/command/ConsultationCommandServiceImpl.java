package com.zud.backend.domain.consultation.service.command;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.domain.consultation.entity.Consultation;
import com.zud.backend.domain.consultation.repository.ConsultationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ConsultationCommandServiceImpl implements ConsultationCommandService {

	private final ConsultationRepository consultationRepository;

	@Override
	public Consultation save(final Consultation consultation) {
		Consultation savedConsultation = consultationRepository.save(consultation);
		log.info("상담 저장 완료: consultationId={}", savedConsultation.getId());
		return savedConsultation;
	}
}
