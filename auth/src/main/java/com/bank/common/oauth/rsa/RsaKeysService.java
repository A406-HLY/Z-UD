package com.bank.common.oauth.rsa;

import java.security.Key;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.proc.SecurityContext;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class RsaKeysService {

	private static final String KEY_ALGORITHM = "RSA";
	private static final int KEY_SIZE = 2048;

	private final RsaKeysRepository repository;

	public RsaKeys saveRsaKeys(final String identifier) {
		RsaKeys rsaKeys = new RsaKeys();

		KeyPair keyPair = generateRsaKey();
		RSAPublicKey publicKey = (RSAPublicKey)keyPair.getPublic();
		RSAPrivateKey privateKey = (RSAPrivateKey)keyPair.getPrivate();

		rsaKeys.setIdentifier(identifier);
		rsaKeys.setKeyId(UUID.randomUUID().toString());
		rsaKeys.setPublicKey(Base64.getEncoder().encodeToString(publicKey.getEncoded()));
		rsaKeys.setPrivateKey(Base64.getEncoder().encodeToString(privateKey.getEncoded()));

		return repository.save(rsaKeys);
	}

	public ImmutableJWKSet<SecurityContext> loadByJwkSet(final String identifier)
		throws NoSuchAlgorithmException, InvalidKeySpecException {
		RsaKeys result = repository.findByIdentifier(identifier)
			.orElseGet(() -> saveRsaKeys(identifier));

		RSAPublicKey publicKey = (RSAPublicKey)getKeyFromEncodedString(result.getPublicKey(), true);
		RSAPrivateKey privateKey = (RSAPrivateKey)getKeyFromEncodedString(result.getPrivateKey(), false);
		RSAKey rsaKey = new RSAKey.Builder(publicKey)
			.privateKey(privateKey)
			.keyID(result.getKeyId())
			.build();

		JWKSet jwkSet = new JWKSet(rsaKey);
		return new ImmutableJWKSet<>(jwkSet);
	}

	private Key getKeyFromEncodedString(final String encodedKey, final boolean isPublic)
		throws NoSuchAlgorithmException, InvalidKeySpecException {
		byte[] decodedKey = Base64.getDecoder().decode(encodedKey);
		KeyFactory keyFactory = KeyFactory.getInstance(KEY_ALGORITHM);
		if (isPublic) {
			return keyFactory.generatePublic(new X509EncodedKeySpec(decodedKey));
		}
		return keyFactory.generatePrivate(new PKCS8EncodedKeySpec(decodedKey));
	}

	private static KeyPair generateRsaKey() {
		KeyPair keyPair;
		try {
			KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(KEY_ALGORITHM);
			keyPairGenerator.initialize(KEY_SIZE);
			keyPair = keyPairGenerator.generateKeyPair();
		} catch (Exception ex) {
			throw new IllegalStateException(ex);
		}
		return keyPair;
	}
}


