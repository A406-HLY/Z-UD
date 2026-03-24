package com.bank.auth.repository;

import org.springframework.data.repository.CrudRepository;

import com.bank.auth.entity.RefreshToken;

public interface RefreshTokenRepository extends CrudRepository<RefreshToken, String> {
}
