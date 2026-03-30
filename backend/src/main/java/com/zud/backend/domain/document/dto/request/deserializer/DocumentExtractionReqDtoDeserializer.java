package com.zud.backend.domain.document.dto.request.deserializer;

import java.util.ArrayList;
import java.util.List;

import com.zud.backend.domain.document.dto.request.DocumentDto;
import com.zud.backend.domain.document.dto.request.DocumentExtractionReqDto;

import tools.jackson.core.JacksonException;
import tools.jackson.core.JsonParser;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.deser.std.StdDeserializer;

public class DocumentExtractionReqDtoDeserializer extends StdDeserializer<DocumentExtractionReqDto> {

	public DocumentExtractionReqDtoDeserializer() {
		super(DocumentExtractionReqDto.class);
	}

	@Override
	public DocumentExtractionReqDto deserialize(JsonParser parser,
		DeserializationContext ctxt) throws JacksonException {
		JsonNode node = parser.readValueAsTree();

		String schemaVersion = stringValue(node, "schemaVersion");
		String consultationId = stringValue(node, "consultationId");
		String processStartedAt = stringValue(node, "processStartedAt");
		String processFinishedAt = stringValue(node, "processFinishedAt");

		List<DocumentDto> documents = null;
		JsonNode documentsNode = node.path("documents");
		if (isPresent(documentsNode) && documentsNode.isArray()) {
			documents = new ArrayList<>();
			for (JsonNode docNode : documentsNode) {
				documents.add(ctxt.readTreeAsValue(docNode, DocumentDto.class));
			}
		}

		return DocumentExtractionReqDto.builder()
			.schemaVersion(schemaVersion)
			.consultationId(consultationId)
			.processStartedAt(processStartedAt)
			.processFinishedAt(processFinishedAt)
			.documents(documents)
			.build();
	}

	private static String stringValue(final JsonNode node, final String field) {
		JsonNode child = node.path(field);
		return isPresent(child) ? child.stringValue() : null;
	}

	private static boolean isPresent(final JsonNode node) {
		return node != null && !node.isMissingNode() && !node.isNull();
	}
}
