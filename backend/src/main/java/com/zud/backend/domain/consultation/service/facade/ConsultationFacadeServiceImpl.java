package com.zud.backend.domain.consultation.service.facade;

import org.springframework.stereotype.Service;

import com.zud.backend.domain.consultation.converter.ConsultationConverter;
import com.zud.backend.domain.consultation.dto.request.CustomerInfoReqDto;
import com.zud.backend.domain.consultation.dto.response.CustomerInfoResDto;
import com.zud.backend.domain.consultation.entity.Consultation;
import com.zud.backend.domain.consultation.service.command.ConsultationCommandService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class ConsultationFacadeServiceImpl implements ConsultationFacadeService {

	private final ConsultationCommandService consultationCommandService;

	@Override
	public CustomerInfoResDto register(final Long userId, final CustomerInfoReqDto reqDto) {
		Consultation consultation = ConsultationConverter.toConsultation(userId, reqDto);
		Consultation savedConsultation = consultationCommandService.save(consultation);
		return ConsultationConverter.toCustomerInfoResDto(savedConsultation);
	}
}
