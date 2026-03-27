package com.bank.auth.repository;

import org.springframework.data.repository.CrudRepository;

import com.bank.auth.entity.TokenBlacklist;

public interface TokenBlacklistRepository extends CrudRepository<TokenBlacklist, String> {
}
