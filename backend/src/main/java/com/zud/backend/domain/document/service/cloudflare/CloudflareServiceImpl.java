package com.zud.backend.domain.document.service.cloudflare;

import java.io.IOException;
import java.time.Duration;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.zud.backend.common.config.properties.CloudflareProperties;
import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.document.exception.DocumentException;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

@Slf4j
@Component
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class CloudflareServiceImpl implements CloudflareService {

	private static final Duration PRESIGNED_URL_EXPIRATION = Duration.ofHours(2);

	private final S3Client s3Client;
	private final S3Presigner s3Presigner;
	private final CloudflareProperties cloudflareProperties;

	@Override
	public String uploadFile(final MultipartFile file, final String directory) {
		String key = buildObjectKey(directory, file.getOriginalFilename());

		try {
			uploadToS3(file, key);
			String presignedUrl = generatePresignedUrl(key);
			log.info("[Cloudflare] 파일 업로드 완료 {key: {}}", key);
			return presignedUrl;

		} catch (S3Exception e) {
			log.error("[Cloudflare] S3 업로드 실패 key:{}, statusCode: {}, errorCode: {}, message: {}",
				key, e.statusCode(), e.awsErrorDetails().errorCode(), e.awsErrorDetails().errorMessage(), e);
			throw new DocumentException(ErrorCode.FILE_UPLOAD_FAILED);
		} catch (IOException _) {
			log.error("[Cloudflare] 파일 읽기 실패 {filename: {}}", file.getOriginalFilename());
			throw new DocumentException(ErrorCode.FILE_UPLOAD_FAILED);
		}
	}

	private void uploadToS3(final MultipartFile file, final String key) throws IOException {
		PutObjectRequest putObjectRequest = PutObjectRequest.builder()
			.bucket(cloudflareProperties.bucket())
			.key(key)
			.contentType(file.getContentType())
			.contentLength(file.getSize())
			.build();

		s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));
	}

	private String buildObjectKey(final String directory, final String originalFilename) {
		return directory + "/" + originalFilename;
	}

	private String generatePresignedUrl(final String key) {
		GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
			.signatureDuration(PRESIGNED_URL_EXPIRATION)
			.getObjectRequest(builder -> builder
				.bucket(cloudflareProperties.bucket())
				.key(key))
			.build();

		PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
		return presignedRequest.url().toString();
	}
}
