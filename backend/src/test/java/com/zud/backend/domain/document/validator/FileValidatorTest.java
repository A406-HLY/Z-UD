package com.zud.backend.domain.document.validator;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.document.dto.request.file.FileMetaDto;
import com.zud.backend.domain.document.exception.DocumentException;

@DisplayName("FileValidator 단위 테스트")
class FileValidatorTest {

	private final FileValidator fileValidator = new FileValidator();

	private FileMetaDto createFileMeta(String fileName, String contentType, Long fileSize) {
		return new FileMetaDto(fileName, contentType, fileSize);
	}

	@Nested
	@DisplayName("validateMeta()")
	class ValidateMeta {

		@Test
		@DisplayName("유효한_PDF_메타정보이면_예외없이_통과")
		void 유효한_PDF_메타정보이면_예외없이_통과() {
			// given
			FileMetaDto fileMeta = createFileMeta("test.pdf", "application/pdf", 1024 * 1024L);

			// when & then
			assertThatCode(() -> fileValidator.validateMeta(fileMeta))
				.doesNotThrowAnyException();
		}

		@Test
		@DisplayName("허용되지_않은_확장자이면_FILE_EXTENSION_NOT_ALLOWED_예외")
		void 허용되지_않은_확장자이면_FILE_EXTENSION_NOT_ALLOWED_예외() {
			// given
			FileMetaDto fileMeta = createFileMeta("test.jpg", "image/jpeg", 1024L);

			// when & then
			assertThatThrownBy(() -> fileValidator.validateMeta(fileMeta))
				.isInstanceOf(DocumentException.class)
				.hasFieldOrPropertyWithValue("errorCode", ErrorCode.FILE_EXTENSION_NOT_ALLOWED);
		}

		@Test
		@DisplayName("contentType_불일치이면_FILE_MIME_TYPE_MISMATCH_예외")
		void contentType_불일치이면_FILE_MIME_TYPE_MISMATCH_예외() {
			// given
			FileMetaDto fileMeta = createFileMeta("test.pdf", "image/jpeg", 1024L);

			// when & then
			assertThatThrownBy(() -> fileValidator.validateMeta(fileMeta))
				.isInstanceOf(DocumentException.class)
				.hasFieldOrPropertyWithValue("errorCode", ErrorCode.FILE_MIME_TYPE_MISMATCH);
		}

		@Test
		@DisplayName("파일_크기_초과이면_FILE_SIZE_EXCEEDED_예외")
		void 파일_크기_초과이면_FILE_SIZE_EXCEEDED_예외() {
			// given
			FileMetaDto fileMeta = createFileMeta("test.pdf", "application/pdf", 11 * 1024 * 1024L);

			// when & then
			assertThatThrownBy(() -> fileValidator.validateMeta(fileMeta))
				.isInstanceOf(DocumentException.class)
				.hasFieldOrPropertyWithValue("errorCode", ErrorCode.FILE_SIZE_EXCEEDED);
		}

		@Test
		@DisplayName("파일_크기_정확히_10MB이면_예외없이_통과")
		void 파일_크기_정확히_10MB이면_예외없이_통과() {
			// given
			FileMetaDto fileMeta = createFileMeta("test.pdf", "application/pdf", 10 * 1024 * 1024L);

			// when & then
			assertThatCode(() -> fileValidator.validateMeta(fileMeta))
				.doesNotThrowAnyException();
		}

		@Test
		@DisplayName("확장자_없는_파일명이면_FILE_EXTENSION_NOT_ALLOWED_예외")
		void 확장자_없는_파일명이면_FILE_EXTENSION_NOT_ALLOWED_예외() {
			// given
			FileMetaDto fileMeta = createFileMeta("testfile", "application/pdf", 1024L);

			// when & then
			assertThatThrownBy(() -> fileValidator.validateMeta(fileMeta))
				.isInstanceOf(DocumentException.class)
				.hasFieldOrPropertyWithValue("errorCode", ErrorCode.FILE_EXTENSION_NOT_ALLOWED);
		}
	}
}
