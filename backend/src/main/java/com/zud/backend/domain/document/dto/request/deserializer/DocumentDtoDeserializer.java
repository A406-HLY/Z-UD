package com.zud.backend.domain.document.dto.request.deserializer;

import java.io.IOException;
import java.util.List;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.zud.backend.domain.document.dto.request.DocumentDto;
import com.zud.backend.domain.document.dto.request.DocumentDto.DocumentClassification;
import com.zud.backend.domain.document.dto.request.DocumentDto.ExtractionDetail;
import com.zud.backend.domain.document.dto.request.DocumentDto.PageInfo;
import com.zud.backend.domain.document.dto.request.DocumentDto.ReviewItem;
import com.zud.backend.domain.document.dto.request.content.DocumentContent;
import com.zud.backend.domain.document.enums.DocumentTag;

public class DocumentDtoDeserializer extends StdDeserializer<DocumentDto> {

	public DocumentDtoDeserializer() {
		this(null);
	}

	public DocumentDtoDeserializer(Class<?> vc) {
		super(vc);
	}

	@Override
	public DocumentDto deserialize(JsonParser parser, DeserializationContext ctxt) throws IOException {
		ObjectMapper mapper = (ObjectMapper)parser.getCodec();
		JsonNode node = mapper.readTree(parser);

		String fileId = node.path("fileId").asText(null);
		String storageType = node.path("storageType").asText(null);
		String bucket = node.path("bucket").asText(null);
		String fileKey = node.path("fileKey").asText(null);
		String fileName = node.path("fileName").asText(null);
		String mimeType = node.path("mimeType").asText(null);
		String status = node.path("status").asText(null);
		String errorCode = node.hasNonNull("errorCode") ? node.path("errorCode").asText() : null;
		String errorMessage = node.hasNonNull("errorMessage") ? node.path("errorMessage").asText() : null;
		String rawText = node.path("rawText").asText(null);

		DocumentClassification classification = null;
		JsonNode classificationNode = node.path("documentClassification");
		if (!classificationNode.isMissingNode() && !classificationNode.isNull()) {
			classification = mapper.treeToValue(classificationNode, DocumentClassification.class);
		}

		ExtractionDetail extraction = null;
		JsonNode extractionNode = node.path("extraction");
		if (!extractionNode.isMissingNode() && !extractionNode.isNull()) {
			String model = extractionNode.path("model").asText(null);
			JsonNode contentNode = extractionNode.path("content");
			DocumentContent content = null;

			if (!contentNode.isMissingNode() && !contentNode.isNull() && classification != null) {
				String docType = classification.documentType();
				DocumentTag tag = DocumentTag.fromDocumentType(docType);
				content = mapper.treeToValue(contentNode, tag.getContentClass());
			}
			extraction = new ExtractionDetail(model, content);
		}

		List<ReviewItem> reviewItems = null;
		JsonNode reviewNode = node.path("reviewItems");
		if (!reviewNode.isMissingNode() && !reviewNode.isNull()) {
			reviewItems = mapper.readValue(reviewNode.traverse(mapper), new TypeReference<>() {
			});
		}

		List<PageInfo> pages = null;
		JsonNode pagesNode = node.path("pages");
		if (!pagesNode.isMissingNode() && !pagesNode.isNull()) {
			pages = mapper.readValue(pagesNode.traverse(mapper), new TypeReference<>() {
			});
		}

		return DocumentDto.builder()
			.fileId(fileId)
			.storageType(storageType)
			.bucket(bucket)
			.fileKey(fileKey)
			.fileName(fileName)
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
}
