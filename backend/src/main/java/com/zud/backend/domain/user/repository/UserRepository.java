package com.zud.backend.domain.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.zud.backend.domain.user.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

	@EntityGraph(attributePaths = {"branch"})
	Optional<User> findByEmployeeNumber(String employeeNumber);
}