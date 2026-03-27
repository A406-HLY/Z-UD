package com.zud.backend.domain.document.dto.request.deserializer;

import java.util.ArrayList;
import java.util.List;

import com.zud.backend.domain.document.dto.request.DocumentDto;
import com.zud.backend.domain.document.dto.request.DocumentDto.DocumentClassification;
import com.zud.backend.domain.document.dto.request.content.DocumentContent;
import com.zud.backend.domain.document.enums.DocumentTag;

import tools.jackson.core.JacksonException;
import tools.jackson.core.JsonParser;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.deser.std.StdDeserializer;

public class DocumentDtoDeserializer extends StdDeserializer<DocumentDto> {

	public DocumentDtoDeserializer() {
		super(DocumentDto.class);
	}

	@Override
	public DocumentDto deserialize(JsonParser parser, DeserializationContext ctxt) throws JacksonException {
		JsonNode node = parser.readValueAsTree();

		String consultationId = stringValue(node, "consultationId");
		String fileId = stringValue(node, "fileId");
		String storageType = stringValue(node, "storageType");
		String bucket = stringValue(node, "bucket");
		String fileKey = stringValue(node, "fileKey");
		String fileName = stringValue(node, "fileName");
		String fileUrl = stringValue(node, "fileUrl");
		String mimeType = stringValue(node, "mimeType");
		String processStartedAt = stringValue(node, "processStartedAt");
		String processFinishedAt = stringValue(node, "processFinishedAt");
		String documentType = stringValue(node, "documentType");
		String documentTypeLabel = stringValue(node, "documentTypeLabel");
		String rawText = stringValue(node, "rawText");
		String status = stringValue(node, "status");

		String error = null;
		JsonNode errorNode = node.path("error");
		if (isPresent(errorNode)) {
			if (errorNode.isValueNode()) {
				error = errorNode.stringValue();
			} else if (errorNode.isObject()) {
				error = stringValue(errorNode, "message");
			}
		}

		DocumentClassification classification = null;
		JsonNode classificationNode = node.path("documentClassification");
		if (isPresent(classificationNode)) {
			classification = ctxt.readTreeAsValue(classificationNode, DocumentClassification.class);
		}

		DocumentContent content = null;
		JsonNode contentNode = node.path("content");
		if (isPresent(contentNode) && classification != null) {
			String docType = classification.documentType();
			DocumentTag tag = DocumentTag.fromDocumentType(docType);
			if (tag != null) {
				content = ctxt.readTreeAsValue(contentNode, tag.getContentClass());
			}
		}

		List<Integer> pageNums = new ArrayList<>();
		JsonNode pageNumsNode = node.path("pageNums");
		if (isPresent(pageNumsNode) && pageNumsNode.isArray()) {
			for (JsonNode num : pageNumsNode) {
				pageNums.add(num.intValue());
			}
		}

		return DocumentDto.builder()
			.consultationId(consultationId)
			.fileId(fileId)
			.storageType(storageType)
			.bucket(bucket)
			.fileKey(fileKey)
			.fileName(fileName)
			.fileUrl(fileUrl)
			.mimeType(mimeType)
			.processStartedAt(processStartedAt)
			.processFinishedAt(processFinishedAt)
			.documentClassification(classification)
			.documentType(documentType)
			.documentTypeLabel(documentTypeLabel)
			.pageNums(pageNums)
			.content(content)
			.rawText(rawText)
			.status(status)
			.error(error)
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
