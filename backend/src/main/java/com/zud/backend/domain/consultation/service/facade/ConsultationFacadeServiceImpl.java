package com.zud.backend.domain.consultation.service.facade;

import org.springframework.stereotype.Service;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.consultation.converter.ConsultationConverter;
import com.zud.backend.domain.consultation.dto.request.ConsultationTransferReqDto;
import com.zud.backend.domain.consultation.dto.request.CustomerInfoReqDto;
import com.zud.backend.domain.consultation.dto.response.CustomerInfoResDto;
import com.zud.backend.domain.consultation.entity.Consultation;
import com.zud.backend.domain.consultation.entity.ConsultationTransfer;
import com.zud.backend.domain.consultation.exception.ConsultationException;
import com.zud.backend.domain.consultation.service.command.ConsultationCommandService;
import com.zud.backend.domain.consultation.service.query.ConsultationQueryService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class ConsultationFacadeServiceImpl implements ConsultationFacadeService {

	private final ConsultationCommandService consultationCommandService;
	private final ConsultationQueryService consultationQueryService;

	@Override
	public CustomerInfoResDto register(final Long userId, final CustomerInfoReqDto reqDto) {
		Consultation consultation = ConsultationConverter.toConsultation(userId, reqDto);
		Consultation savedConsultation = consultationCommandService.save(consultation);
		return ConsultationConverter.toCustomerInfoResDto(savedConsultation);
	}

	@Override
	public void transferConsultation(
		final Long userId,
		final String consultationId,
		final ConsultationTransferReqDto reqDto
	) {
		Consultation consultation = consultationQueryService.findByUuid(consultationId);
		validateOwner(userId, consultation);

		ConsultationTransfer transfer = ConsultationConverter.toConsultationTransfer(consultation.getId(), reqDto);
		consultationCommandService.saveTransfer(transfer);
		log.info("[Consultation] 전산 이관 요청 수신: userId={}, consultationId={}, employmentType={}",
			userId,
			consultationId,
			reqDto.reportInput().employmentType());
	}

	private void validateOwner(final Long userId, final Consultation consultation) {
		if (!consultation.getUserId().equals(userId)) {
			throw new ConsultationException(ErrorCode.ACCESS_DENIED);
		}
	}
}
