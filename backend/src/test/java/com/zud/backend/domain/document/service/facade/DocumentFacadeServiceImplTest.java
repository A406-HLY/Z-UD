package com.zud.backend.domain.document.service.facade;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

import java.util.List;
import java.util.concurrent.Executor;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.zud.backend.domain.consultation.entity.Consultation;
import com.zud.backend.domain.consultation.service.ConsultationStatusService;
import com.zud.backend.domain.consultation.service.query.ConsultationQueryService;
import com.zud.backend.domain.document.dto.request.file.FileMetaDto;
import com.zud.backend.domain.document.dto.request.file.PresignedUrlReqDto;
import com.zud.backend.domain.document.dto.request.file.UploadCompletionReqDto;
import com.zud.backend.domain.document.dto.request.file.UploadResultDto;
import com.zud.backend.domain.document.dto.response.file.PresignedUrlResDto;
import com.zud.backend.domain.document.dto.response.file.UploadCompletionResDto;
import com.zud.backend.domain.document.repository.OcrResultRedisRepository;
import com.zud.backend.domain.document.service.cloudflare.CloudflareService;
import com.zud.backend.domain.document.service.kafka.OcrKafkaProducer;
import com.zud.backend.domain.document.validator.DocumentValidator;
import com.zud.backend.domain.document.validator.FileValidator;

@ExtendWith(MockitoExtension.class)
@DisplayName("DocumentFacadeServiceImpl 단위 테스트")
class DocumentFacadeServiceImplTest {

	@Mock
	private Executor applicationTaskExecutor;
	@Mock
	private ConsultationStatusService consultationStatusService;
	@Mock
	private ConsultationQueryService consultationQueryService;
	@Mock
	private CloudflareService cloudflareService;
	@Mock
	private OcrKafkaProducer ocrKafkaProducer;
	@Mock
	private OcrResultRedisRepository ocrResultRedisRepository;
	@Mock
	private FileValidator fileValidator;
	@Mock
	private DocumentValidator documentValidator;
	@InjectMocks
	private DocumentFacadeServiceImpl documentFacadeService;

	private static final String CONSULTATION_ID = "consult-123";

	@Nested
	@DisplayName("issuePresignedUrls()")
	class IssuePresignedUrls {

		@Test
		@DisplayName("정상_요청이면_파일_수만큼_Presigned_URL_반환")
		void 정상_요청이면_파일_수만큼_Presigned_URL_반환() {
			// given
			List<FileMetaDto> files = List.of(
				new FileMetaDto("a.pdf", "application/pdf", 1024L),
				new FileMetaDto("b.pdf", "application/pdf", 2048L)
			);
			PresignedUrlReqDto reqDto = new PresignedUrlReqDto(CONSULTATION_ID, files);

			given(consultationQueryService.findByUuid(CONSULTATION_ID)).willReturn(mock(Consultation.class));
			willDoNothing().given(fileValidator).validateMeta(any(FileMetaDto.class));
			given(cloudflareService.generatePutPresignedUrl(eq(CONSULTATION_ID), any(FileMetaDto.class)))
				.willReturn("https://presigned-url-a", "https://presigned-url-b");

			// when
			PresignedUrlResDto result = documentFacadeService.issuePresignedUrls(reqDto);

			// then
			assertThat(result.files()).hasSize(2);
			assertThat(result.files().get(0).fileName()).isEqualTo("a.pdf");
			assertThat(result.files().get(1).fileName()).isEqualTo("b.pdf");
			then(fileValidator).should(times(2)).validateMeta(any(FileMetaDto.class));
		}

		@Test
		@DisplayName("존재하지_않는_consultationId이면_예외_발생")
		void 존재하지_않는_consultationId이면_예외_발생() {
			// given
			PresignedUrlReqDto reqDto = new PresignedUrlReqDto("invalid-id",
				List.of(new FileMetaDto("a.pdf", "application/pdf", 1024L)));

			given(consultationQueryService.findByUuid("invalid-id"))
				.willThrow(new RuntimeException("상담을 찾을 수 없습니다."));

			// when & then
			assertThatThrownBy(() -> documentFacadeService.issuePresignedUrls(reqDto))
				.isInstanceOf(RuntimeException.class);
		}
	}

	@Nested
	@DisplayName("completeUpload()")
	class CompleteUpload {

		@Test
		@DisplayName("모든_파일_성공이면_OCR_QUEUED_상태_반환")
		void 모든_파일_성공이면_OCR_QUEUED_상태_반환() {
			// given
			UploadCompletionReqDto reqDto = new UploadCompletionReqDto(List.of(
				new UploadResultDto("a.pdf", true),
				new UploadResultDto("b.pdf", true)
			));

			given(consultationQueryService.findByUuid(CONSULTATION_ID)).willReturn(mock(Consultation.class));
			given(cloudflareService.generateGetPresignedUrl(eq(CONSULTATION_ID), anyString()))
				.willReturn("https://signed-get-url");

			// when
			UploadCompletionResDto result = documentFacadeService.completeUpload(CONSULTATION_ID, reqDto);

			// then
			assertThat(result.status()).isEqualTo("OCR_QUEUED");
			assertThat(result.successCount()).isEqualTo(2);
			assertThat(result.failedFiles()).isEmpty();
		}

		@Test
		@DisplayName("일부_파일_실패이면_OCR_QUEUED_상태와_실패_파일명_반환")
		void 일부_파일_실패이면_OCR_QUEUED_상태와_실패_파일명_반환() {
			// given
			UploadCompletionReqDto reqDto = new UploadCompletionReqDto(List.of(
				new UploadResultDto("a.pdf", true),
				new UploadResultDto("b.pdf", false)
			));

			given(consultationQueryService.findByUuid(CONSULTATION_ID)).willReturn(mock(Consultation.class));
			given(cloudflareService.generateGetPresignedUrl(eq(CONSULTATION_ID), anyString()))
				.willReturn("https://signed-get-url");

			// when
			UploadCompletionResDto result = documentFacadeService.completeUpload(CONSULTATION_ID, reqDto);

			// then
			assertThat(result.status()).isEqualTo("OCR_QUEUED");
			assertThat(result.successCount()).isEqualTo(1);
			assertThat(result.failedFiles()).containsExactly("b.pdf");
		}

		@Test
		@DisplayName("모든_파일_실패이면_FAILED_상태_반환")
		void 모든_파일_실패이면_FAILED_상태_반환() {
			// given
			UploadCompletionReqDto reqDto = new UploadCompletionReqDto(List.of(
				new UploadResultDto("a.pdf", false),
				new UploadResultDto("b.pdf", false)
			));

			given(consultationQueryService.findByUuid(CONSULTATION_ID)).willReturn(mock(Consultation.class));

			// when
			UploadCompletionResDto result = documentFacadeService.completeUpload(CONSULTATION_ID, reqDto);

			// then
			assertThat(result.status()).isEqualTo("FAILED");
			assertThat(result.successCount()).isZero();
			assertThat(result.failedFiles()).containsExactlyInAnyOrder("a.pdf", "b.pdf");
		}

		@Test
		@DisplayName("존재하지_않는_consultationId이면_예외_발생")
		void 존재하지_않는_consultationId이면_예외_발생() {
			// given
			UploadCompletionReqDto reqDto = new UploadCompletionReqDto(List.of(
				new UploadResultDto("a.pdf", true)
			));

			given(consultationQueryService.findByUuid("invalid-id"))
				.willThrow(new RuntimeException("상담을 찾을 수 없습니다."));

			// when & then
			assertThatThrownBy(() -> documentFacadeService.completeUpload("invalid-id", reqDto))
				.isInstanceOf(RuntimeException.class);
		}
	}
}
