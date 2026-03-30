package com.zud.backend.domain.document.enums;

public enum OcrEventType {
	OCR_COMPLETED("OCR 분석이 완료되었습니다."),
	OCR_FAILED("OCR 분석 처리에 실패했습니다.");

	private final String defaultMessage;

	OcrEventType(final String defaultMessage) {
		this.defaultMessage = defaultMessage;
	}

	public String defaultMessage() {
		return defaultMessage;
	}
}
