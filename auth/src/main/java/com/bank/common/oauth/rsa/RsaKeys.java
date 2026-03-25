package com.bank.common.oauth.rsa;

import com.bank.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@Builder(toBuilder = true)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "rsa_keys")
public class RsaKeys extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "identifier", length = 100, nullable = false, unique = true)
	private String identifier;

	@Column(name = "key_id", length = 100, nullable = false, unique = true)
	private String keyId;

	@Column(name = "public_key", nullable = false, columnDefinition = "TEXT")
	private String publicKey;

	@Column(name = "private_key", nullable = false, columnDefinition = "TEXT")
	private String privateKey;
}

