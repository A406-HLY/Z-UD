package com.zud.backend.domain.document.service.cloudflare;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

import java.net.URI;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.zud.backend.common.config.properties.CloudflareProperties;
import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.document.dto.request.file.FileMetaDto;
import com.zud.backend.domain.document.exception.DocumentException;

import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

@ExtendWith(MockitoExtension.class)
@DisplayName("CloudflareServiceImpl 단위 테스트")
class CloudflareServiceImplTest {

	@Mock
	private S3Presigner s3Presigner;
	@Mock
	private CloudflareProperties cloudflareProperties;
	@InjectMocks
	private CloudflareServiceImpl cloudflareService;

	private FileMetaDto createFileMeta() {
		return new FileMetaDto("test.pdf", "application/pdf", 1024L);
	}

	@Nested
	@DisplayName("generatePutPresignedUrl()")
	class GeneratePutPresignedUrl {

		@Test
		@DisplayName("정상_요청이면_Presigned_URL_반환")
		void 정상_요청이면_Presigned_URL_반환() throws Exception {
			// given
			given(cloudflareProperties.bucket()).willReturn("test-bucket");

			PresignedPutObjectRequest presignedRequest = mock(PresignedPutObjectRequest.class);
			given(presignedRequest.url()).willReturn(
				URI.create("https://example.r2.cloudflarestorage.com/presigned").toURL());
			given(s3Presigner.presignPutObject(any(PutObjectPresignRequest.class))).willReturn(presignedRequest);

			// when
			String result = createPresignedUrl();

			// then
			assertThat(result).isEqualTo("https://example.r2.cloudflarestorage.com/presigned");
		}

		@Test
		@DisplayName("S3Exception_발생시_PRESIGNED_URL_GENERATION_FAILED_예외")
		void S3Exception_발생시_PRESIGNED_URL_GENERATION_FAILED_예외() {
			// given
			given(cloudflareProperties.bucket()).willReturn("test-bucket");
			given(s3Presigner.presignPutObject(any(PutObjectPresignRequest.class)))
				.willThrow(S3Exception.builder().message("S3 error").build());

			// when & then

			assertThatThrownBy(this::createPresignedUrl)
				.isInstanceOf(DocumentException.class)
				.hasFieldOrPropertyWithValue("errorCode", ErrorCode.PRESIGNED_URL_GENERATION_FAILED);
		}

		private String createPresignedUrl() {
			return cloudflareService.generatePutPresignedUrl("290b84d9-657e-4341-8b84-d9657e434133", createFileMeta());
		}
	}
}
