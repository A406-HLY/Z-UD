package com.zud.backend.domain.consultation.dto.request.deserializer;

import com.zud.backend.domain.consultation.dto.request.ConsultationTransferReqDto;
import com.zud.backend.domain.consultation.dto.request.ConsultationTransferReqDto.EmployeeReportInput;
import com.zud.backend.domain.consultation.dto.request.ConsultationTransferReqDto.SelfEmployedReportInput;
import com.zud.backend.domain.consultation.dto.request.ConsultationTransferReqDto.TransferReportInput;
import com.zud.backend.domain.consultation.enums.EmploymentType;

import tools.jackson.core.JacksonException;
import tools.jackson.core.JsonParser;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.deser.std.StdDeserializer;
import tools.jackson.databind.exc.MismatchedInputException;

public class ConsultationTransferReqDtoDeserializer extends StdDeserializer<ConsultationTransferReqDto> {

	public ConsultationTransferReqDtoDeserializer() {
		super(ConsultationTransferReqDto.class);
	}

	@Override
	public ConsultationTransferReqDto deserialize(JsonParser parser, DeserializationContext ctxt)
		throws JacksonException {
		JsonNode rootNode = parser.readValueAsTree();
		JsonNode reportInputNode = rootNode.path("reportInput");

		if (reportInputNode.isMissingNode() || reportInputNode.isNull()) {
			throw MismatchedInputException.from(parser, ConsultationTransferReqDto.class,
				"reportInput 은 필수 입력값 입니다.");
		}

		JsonNode employmentTypeNode = reportInputNode.path("employmentType");
		if (employmentTypeNode.isMissingNode() || employmentTypeNode.isNull()) {
			throw MismatchedInputException.from(parser, ConsultationTransferReqDto.class,
				"employmentType 은 필수 입력값 입니다.");
		}

		EmploymentType employmentType;
		try {
			employmentType = EmploymentType.valueOf(employmentTypeNode.stringValue());
		} catch (IllegalArgumentException _) {
			throw MismatchedInputException.from(parser, ConsultationTransferReqDto.class,
				"지원하지 않는 employmentType 입니다: " + employmentTypeNode.stringValue());
		}

		TransferReportInput reportInput = switch (employmentType) {
			case EMPLOYEE -> ctxt.readTreeAsValue(reportInputNode, EmployeeReportInput.class);
			case SELF_EMPLOYED -> ctxt.readTreeAsValue(reportInputNode, SelfEmployedReportInput.class);
		};

		return ConsultationTransferReqDto.builder().reportInput(reportInput).build();
	}
}
