package com.zud.backend.domain.consultation.service.query;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.consultation.entity.Consultation;
import com.zud.backend.domain.consultation.exception.ConsultationException;
import com.zud.backend.domain.consultation.repository.ConsultationRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class ConsultationQueryServiceImpl implements ConsultationQueryService {

	private final ConsultationRepository consultationRepository;

	@Override
	public Consultation findByUuid(final String uuid) {
		Consultation consultation = consultationRepository.findById(uuid)
			.orElseThrow(() -> new ConsultationException(ErrorCode.CONSULTATION_NOT_FOUND));
		log.info("[Consultation] 상담 조회 완료: id: {}", consultation.getId());
		return consultation;
	}
}
