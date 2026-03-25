package com.zud.backend.domain.consultation.converter;

import com.zud.backend.domain.consultation.dto.request.CustomerInfoReqDto;
import com.zud.backend.domain.consultation.dto.response.CustomerInfoResDto;
import com.zud.backend.domain.consultation.entity.Consultation;

import lombok.experimental.UtilityClass;

@UtilityClass
public class ConsultationConverter {

	public Consultation toConsultation(final Long userId, final CustomerInfoReqDto reqDto) {
		return Consultation.create(
			userId,
			reqDto.name(),
			reqDto.phoneNumber(),
			reqDto.residentRegistrationNumber(),
			reqDto.employmentType(),
			reqDto.targetLoanAmount(),
			reqDto.loanPurpose(),
			reqDto.ownedHouseCount()
		);
	}

	public CustomerInfoResDto toCustomerInfoResDto(final Consultation consultation) {
		return CustomerInfoResDto.builder()
			.id(consultation.getId())
			.name(consultation.getName())
			.build();
	}
}
