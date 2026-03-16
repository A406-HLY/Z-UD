package com.zud.backend.domain.document.validator;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.document.exception.DocumentException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class FileValidator {

	private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
	private static final int SIGNATURE_BUFFER_SIZE = 8;

	private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf");

	private static final Map<String, List<String>> VALID_MIME_TYPES = Map.of(
		"pdf", List.of("application/pdf")
	);

	private static final Map<String, byte[]> FILE_SIGNATURES = Map.of(
		"pdf", new byte[] {0x25, 0x50, 0x44, 0x46} // %PDF
	);

	public void validateFile(final MultipartFile file) {
		validateNotEmpty(file);
		String filename = file.getOriginalFilename();
		String extension = validateExtension(filename);
		validateMimeType(file, extension);
		validateFileSignature(file, extension);
		validateFileSize(file);
	}

	private void validateNotEmpty(final MultipartFile file) {
		if (file.isEmpty()) {
			throw new DocumentException(ErrorCode.FILE_EMPTY);
		}
	}

	private String validateExtension(final String filename) {
		String extension = StringUtils.getFilenameExtension(filename);

		if (extension == null || !ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
			throw new DocumentException(ErrorCode.FILE_EXTENSION_NOT_ALLOWED);
		}

		return extension.toLowerCase();
	}

	private void validateMimeType(final MultipartFile file, final String extension) {
		String contentType = file.getContentType();

		if (contentType == null) {
			throw new DocumentException(ErrorCode.FILE_MIME_TYPE_MISMATCH);
		}

		List<String> validTypes = VALID_MIME_TYPES.get(extension);
		if (validTypes == null || !validTypes.contains(contentType)) {
			throw new DocumentException(ErrorCode.FILE_MIME_TYPE_MISMATCH);
		}
	}

	private void validateFileSignature(final MultipartFile file, final String extension) {
		byte[] fileHeader = readFileHeader(file);
		byte[] expectedSignature = FILE_SIGNATURES.get(extension);

		if (expectedSignature == null) {
			throw new DocumentException(ErrorCode.FILE_SIGNATURE_MISMATCH);
		}

		if (fileHeader.length < expectedSignature.length) {
			throw new DocumentException(ErrorCode.FILE_SIGNATURE_MISMATCH);
		}

		byte[] actualPrefix = Arrays.copyOf(fileHeader, expectedSignature.length);
		if (!Arrays.equals(actualPrefix, expectedSignature)) {
			throw new DocumentException(ErrorCode.FILE_SIGNATURE_MISMATCH);
		}
	}

	private byte[] readFileHeader(final MultipartFile file) {
		byte[] buffer = new byte[SIGNATURE_BUFFER_SIZE];
		try (InputStream inputStream = file.getInputStream()) {
			int bytesRead = inputStream.read(buffer);
			if (bytesRead < buffer.length) {
				return Arrays.copyOf(buffer, bytesRead);
			}
		} catch (IOException _) {
			throw new DocumentException(ErrorCode.FILE_SIGNATURE_MISMATCH);
		}
		return buffer;
	}

	private void validateFileSize(final MultipartFile file) {
		if (file.getSize() > MAX_FILE_SIZE) {
			throw new DocumentException(ErrorCode.FILE_SIZE_EXCEEDED);
		}
	}
}