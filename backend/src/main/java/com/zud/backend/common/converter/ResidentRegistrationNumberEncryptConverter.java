package com.zud.backend.common.converter;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.common.error.exception.BusinessException;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class ResidentRegistrationNumberEncryptConverter implements AttributeConverter<String, String> {

	private static final String TRANSFORMATION = "AES/GCM/NoPadding";
	private static final String ALGORITHM = "AES";
	private static final String KEY_ENV_NAME = "RRN_ENCRYPTION_KEY";
	private static final int IV_LENGTH = 12;
	private static final int TAG_LENGTH_BIT = 128;

	private final SecureRandom secureRandom = new SecureRandom();
	private SecretKey secretKey;

	@Override
	public String convertToDatabaseColumn(final String attribute) {
		if (attribute == null || attribute.isBlank()) {
			return attribute;
		}

		try {
			byte[] iv = new byte[IV_LENGTH];
			secureRandom.nextBytes(iv);

			Cipher cipher = Cipher.getInstance(TRANSFORMATION);
			cipher.init(Cipher.ENCRYPT_MODE, getSecretKey(), new GCMParameterSpec(TAG_LENGTH_BIT, iv));

			byte[] encrypted = cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8));
			byte[] packed = new byte[iv.length + encrypted.length];
			System.arraycopy(iv, 0, packed, 0, iv.length);
			System.arraycopy(encrypted, 0, packed, iv.length, encrypted.length);

			return Base64.getEncoder().encodeToString(packed);
		} catch (GeneralSecurityException ex) {
			throw new BusinessException(ErrorCode.ENCRYPTION_FAILED);
		}
	}

	@Override
	public String convertToEntityAttribute(final String dbData) {
		if (dbData == null || dbData.isBlank()) {
			return dbData;
		}

		try {
			byte[] packed = Base64.getDecoder().decode(dbData);
			if (packed.length <= IV_LENGTH) {
				throw new BusinessException(ErrorCode.ENCRYPTED_DATA_INVALID);
			}

			byte[] iv = new byte[IV_LENGTH];
			byte[] encrypted = new byte[packed.length - IV_LENGTH];
			System.arraycopy(packed, 0, iv, 0, IV_LENGTH);
			System.arraycopy(packed, IV_LENGTH, encrypted, 0, encrypted.length);

			Cipher cipher = Cipher.getInstance(TRANSFORMATION);
			cipher.init(Cipher.DECRYPT_MODE, getSecretKey(), new GCMParameterSpec(TAG_LENGTH_BIT, iv));

			byte[] plain = cipher.doFinal(encrypted);
			return new String(plain, StandardCharsets.UTF_8);
		} catch (GeneralSecurityException ex) {
			throw new BusinessException(ErrorCode.DECRYPTION_FAILED);
		}
	}

	private SecretKey getSecretKey() {
		if (secretKey == null) {
			secretKey = loadSecretKey();
		}
		return secretKey;
	}

	private SecretKey loadSecretKey() {
		String encodedKey = System.getenv(KEY_ENV_NAME);
		if (encodedKey == null || encodedKey.isBlank()) {
			throw new IllegalStateException("환경변수 RRN_ENCRYPTION_KEY가 설정되지 않았습니다.");
		}

		try {
			byte[] decoded = Base64.getDecoder().decode(encodedKey);
			if (decoded.length != 16 && decoded.length != 24 && decoded.length != 32) {
				throw new IllegalStateException("RRN_ENCRYPTION_KEY는 Base64 인코딩된 16/24/32바이트 키여야 합니다.");
			}
			return new SecretKeySpec(decoded, ALGORITHM);
		} catch (IllegalArgumentException ex) {
			throw new IllegalStateException("RRN_ENCRYPTION_KEY는 Base64 문자열이어야 합니다.", ex);
		}
	}
}
