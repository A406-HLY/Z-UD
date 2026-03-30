package com.zud.backend.domain.consultation.converter;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.consultation.dto.request.ConsultationTransferReqDto;
import com.zud.backend.domain.consultation.dto.request.ConsultationTransferReqDto.EmployeeReportInput;
import com.zud.backend.domain.consultation.dto.request.ConsultationTransferReqDto.SelfEmployedReportInput;
import com.zud.backend.domain.consultation.dto.request.CustomerInfoReqDto;
import com.zud.backend.domain.consultation.dto.response.CustomerInfoResDto;
import com.zud.backend.domain.consultation.entity.Consultation;
import com.zud.backend.domain.consultation.entity.ConsultationTransfer;
import com.zud.backend.domain.consultation.entity.ConsultationTransferEmployeeDetail;
import com.zud.backend.domain.consultation.entity.ConsultationTransferSelfEmployedDetail;
import com.zud.backend.domain.consultation.exception.ConsultationException;

import lombok.experimental.UtilityClass;
import tools.jackson.core.exc.StreamWriteException;
import tools.jackson.databind.DatabindException;
import tools.jackson.databind.ObjectMapper;

@UtilityClass
public class ConsultationConverter {

	private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

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

	public ConsultationTransfer toConsultationTransfer(
		final String consultationId,
		final ConsultationTransferReqDto reqDto
	) {
		ConsultationTransfer transfer = ConsultationTransfer.builder()
			.consultationId(consultationId)
			.employmentType(reqDto.reportInput().employmentType())
			.manualReviewRequired(reqDto.reportInput().manualReviewRequired())
			.collateralMarketPrice(reqDto.reportInput().collateralMarketPrice())
			.totalRemainingLoanBalance(reqDto.reportInput().totalRemainingLoanBalance())
			.creditRating(reqDto.reportInput().creditRating())
			.annualPrincipalAndInterestRepayment(reqDto.reportInput().annualPrincipalAndInterestRepayment())
			.reportInputJson(toJson(reqDto.reportInput()))
			.build();

		if (reqDto.reportInput() instanceof EmployeeReportInput employee) {
			transfer.assignEmployeeDetail(ConsultationTransferEmployeeDetail.builder()
				.transfer(transfer)
				.hasRepresentativeName(employee.hasRepresentativeName())
				.hasCompanySeal(employee.hasCompanySeal())
				.subscriberType(employee.subscriberType())
				.latestAcquisitionDate(employee.latestAcquisitionDate())
				.latestLossDate(employee.latestLossDate())
				.workPeriod(employee.workPeriod())
				.annualIncomeTotal(employee.annualIncomeTotal())
				.build());
			return transfer;
		}

		if (reqDto.reportInput() instanceof SelfEmployedReportInput selfEmployee) {
			transfer.assignSelfEmployedDetail(ConsultationTransferSelfEmployedDetail.builder()
				.transfer(transfer)
				.businessName(selfEmployee.businessName())
				.businessRegistrationNumber(selfEmployee.businessRegistrationNumber())
				.incomeYear(selfEmployee.incomeYear())
				.incomeAmount(selfEmployee.incomeAmount())
				.taxableSalesAmount(selfEmployee.taxableSalesAmount())
				.build());
			return transfer;
		}
		return transfer;
	}

	private String toJson(final Object source) {
		try {
			return OBJECT_MAPPER.writeValueAsString(source);
		} catch (StreamWriteException | DatabindException _) {
			throw new ConsultationException(ErrorCode.SERIALIZE_ERROR);
		}
	}
}
