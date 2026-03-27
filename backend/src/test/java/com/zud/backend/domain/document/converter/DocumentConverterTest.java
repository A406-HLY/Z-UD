package com.zud.backend.domain.document.converter;

import static org.assertj.core.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.zud.backend.domain.consultation.enums.CounselStatus;
import com.zud.backend.domain.document.dto.response.file.PresignedFileDto;
import com.zud.backend.domain.document.dto.response.file.PresignedUrlResDto;
import com.zud.backend.domain.document.dto.response.file.UploadCompletionResDto;

@DisplayName("DocumentConverter 단위 테스트")
class DocumentConverterTest {

	@Test
	@DisplayName("toPresignedFileDto_필드값_매핑_일치")
	void toPresignedFileDto_필드값_매핑_일치() {
		// when
		PresignedFileDto result = DocumentConverter.toPresignedFileDto("test.pdf", "https://example.com/presigned",
			600);

		// then
		assertThat(result.fileName()).isEqualTo("test.pdf");
		assertThat(result.presignedUrl()).isEqualTo("https://example.com/presigned");
		assertThat(result.expiresIn()).isEqualTo(600);
	}

	@Test
	@DisplayName("toPresignedUrlResDto_files_리스트_매핑_일치")
	void toPresignedUrlResDto_files_리스트_매핑_일치() {
		// given
		List<PresignedFileDto> files = List.of(
			DocumentConverter.toPresignedFileDto("a.pdf", "https://url-a", 600),
			DocumentConverter.toPresignedFileDto("b.pdf", "https://url-b", 600)
		);

		// when
		PresignedUrlResDto result = DocumentConverter.toPresignedUrlResDto(files);

		// then
		assertThat(result.files()).hasSize(2);
		assertThat(result.files().get(0).fileName()).isEqualTo("a.pdf");
		assertThat(result.files().get(1).fileName()).isEqualTo("b.pdf");
	}

	@Test
	@DisplayName("toUploadCompletionResDto_모든_필드_매핑_일치")
	void toUploadCompletionResDto_모든_필드_매핑_일치() {
		// given
		String consultationId = "290b84d9-657e-4341-8b84-d9657e434133";
		CounselStatus status = CounselStatus.OCR_QUEUED;
		int successCount = 2;
		List<String> failedFiles = List.of("failed.pdf");

		// when
		UploadCompletionResDto result = DocumentConverter.toUploadCompletionResDto(
			consultationId, status, successCount, failedFiles);

		// then
		assertThat(result.consultationId()).isEqualTo("290b84d9-657e-4341-8b84-d9657e434133");
		assertThat(result.status()).isEqualTo("OCR_QUEUED");
		assertThat(result.successCount()).isEqualTo(2);
		assertThat(result.failedFiles()).containsExactly("failed.pdf");
	}
}
