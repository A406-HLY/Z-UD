package com.zud.backend.domain.document.dto.request.deserializer;

import java.util.ArrayList;
import java.util.List;

import com.zud.backend.domain.document.dto.request.DocumentDto;
import com.zud.backend.domain.document.dto.request.DocumentDto.DocumentClassification;
import com.zud.backend.domain.document.dto.request.DocumentDto.ExtractionDetail;
import com.zud.backend.domain.document.dto.request.DocumentDto.PageInfo;
import com.zud.backend.domain.document.dto.request.DocumentDto.ReviewItem;
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

		String fileId = stringValue(node, "fileId");
		String storageType = stringValue(node, "storageType");
		String bucket = stringValue(node, "bucket");
		String fileKey = stringValue(node, "fileKey");
		String fileName = stringValue(node, "fileName");
		String fileUrl = stringValue(node, "fileUrl");
		String mimeType = stringValue(node, "mimeType");
		String status = stringValue(node, "status");
		String rawText = stringValue(node, "rawText");

		String errorCode = null;
		String errorMessage = null;
		if (isPresent(node.path("errorCode"))) {
			errorCode = node.path("errorCode").stringValue();
		}
		if (isPresent(node.path("errorMessage"))) {
			errorMessage = node.path("errorMessage").stringValue();
		}
		if (isPresent(node.path("error"))) {
			JsonNode errorNode = node.path("error");
			if (errorNode.isValueNode() && errorNode.stringValue() != null) {
				errorMessage = errorNode.stringValue();
			} else if (errorNode.isObject()) {
				errorCode = isPresent(errorNode.path("code")) ? errorNode.path("code").stringValue() : errorCode;
				errorMessage =
					isPresent(errorNode.path("message")) ? errorNode.path("message").stringValue() : errorMessage;
			}
		}

		DocumentClassification classification = null;
		JsonNode classificationNode = node.path("documentClassification");
		if (isPresent(classificationNode)) {
			classification = ctxt.readTreeAsValue(classificationNode, DocumentClassification.class);
		}

		ExtractionDetail extraction = null;
		JsonNode extractionNode = node.path("extraction");
		JsonNode contentNode;
		String model = null;
		if (isPresent(extractionNode)) {
			model = stringValue(extractionNode, "model");
			contentNode = extractionNode.path("content");
		} else {
			contentNode = node.path("content");
		}

		if (isPresent(contentNode) && classification != null) {
			String docType = classification.documentType();
			DocumentTag tag = DocumentTag.fromDocumentType(docType);
			if (tag != null) {
				DocumentContent content = ctxt.readTreeAsValue(contentNode, tag.getContentClass());
				extraction = new ExtractionDetail(model, content);
			}
		}

		List<ReviewItem> reviewItems = new ArrayList<>();
		JsonNode reviewNode = node.path("reviewItems");
		if (isPresent(reviewNode) && reviewNode.isArray()) {
			for (JsonNode item : reviewNode) {
				reviewItems.add(ctxt.readTreeAsValue(item, ReviewItem.class));
			}
		}

		List<PageInfo> pages = new ArrayList<>();
		JsonNode pagesNode = node.path("pages");
		if (isPresent(pagesNode) && pagesNode.isArray()) {
			for (JsonNode page : pagesNode) {
				pages.add(ctxt.readTreeAsValue(page, PageInfo.class));
			}
		} else {
			JsonNode pageNumsNode = node.path("pageNums");
			if (isPresent(pageNumsNode) && pageNumsNode.isArray()) {
				for (JsonNode num : pageNumsNode) {
					pages.add(new PageInfo(num.intValue()));
				}
			}
		}

		return DocumentDto.builder()
			.fileId(fileId)
			.storageType(storageType)
			.bucket(bucket)
			.fileKey(fileKey)
			.fileName(fileName)
			.fileUrl(fileUrl)
			.mimeType(mimeType)
			.status(status)
			.errorCode(errorCode)
			.errorMessage(errorMessage)
			.documentClassification(classification)
			.extraction(extraction)
			.reviewItems(reviewItems)
			.rawText(rawText)
			.pages(pages)
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
