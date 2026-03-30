package com.zud.backend.common.kafka;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class KafkaTopics {

	public static final String REPORT_REQUEST = "report-request";
	public static final String REPORT_RESPONSE = "report-response";
	public static final String OCR_REQUEST = "ocr-request";
	public static final String OCR_RESPONSE = "ocr-response";
	public static final String RULES_UPDATE = "rules-update";
}
