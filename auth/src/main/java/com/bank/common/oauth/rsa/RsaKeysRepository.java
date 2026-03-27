package com.bank.common.oauth.rsa;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RsaKeysRepository extends JpaRepository<RsaKeys, Long> {

	Optional<RsaKeys> findByIdentifier(String identifier);
}

