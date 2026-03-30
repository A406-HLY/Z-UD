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
import tools.jackson.databind.node.ObjectNode;

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

		ObjectNode normalizedReportInput = normalizeReportInput(parser, reportInputNode);
		TransferReportInput reportInput = switch (employmentType) {
			case EMPLOYEE -> ctxt.readTreeAsValue(normalizedReportInput, EmployeeReportInput.class);
			case SELF_EMPLOYED -> ctxt.readTreeAsValue(normalizedReportInput, SelfEmployedReportInput.class);
		};

		return ConsultationTransferReqDto.builder().reportInput(reportInput).build();
	}

	private ObjectNode normalizeReportInput(final JsonParser parser, final JsonNode reportInputNode)
		throws MismatchedInputException {
		if (!(reportInputNode instanceof ObjectNode objectNode)) {
			throw MismatchedInputException.from(parser, ConsultationTransferReqDto.class,
				"reportInput 은 JSON 객체여야 합니다.");
		}

		ObjectNode normalized = objectNode.deepCopy();
		copyIfMissing(normalized, "hasRepresentativeName", "representativeName");
		copyIfMissing(normalized, "isViolationBuilding", "violationBuilding");

		normalizeLoanPurpose(normalized);
		return normalized;
	}

	private void copyIfMissing(final ObjectNode target, final String toField, final String fromField) {
		JsonNode current = target.get(toField);
		JsonNode source = target.get(fromField);
		if ((current == null || current.isNull()) && source != null && !source.isNull()) {
			target.set(toField, source);
		}
	}

	private void normalizeLoanPurpose(final ObjectNode reportInput) {
		JsonNode loanPurposeNode = reportInput.get("loanPurpose");
		if (loanPurposeNode == null || loanPurposeNode.isNull() || loanPurposeNode.stringValue() == null) {
			return;
		}

		String rawValue = loanPurposeNode.stringValue();
		String normalized = switch (rawValue.replaceAll("\\s+", "")) {
			case "주택구매", "주택구입", "주택구입목적", "주택매매" -> "HOME_PURCHASE";
			case "융자", "대환", "대환대출", "재융자" -> "REFINANCE";
			case "전세금", "전세자금" -> "JEONSE_DEPOSIT";
			case "주거안정", "생활안정", "주거안정자금" -> "LIVING_STABILITY";
			case "기타" -> "OTHER";
			default -> rawValue;
		};
		reportInput.put("loanPurpose", normalized);
	}

}
