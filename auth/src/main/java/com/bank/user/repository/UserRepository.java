package com.bank.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bank.user.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmployeeNumber(String employeeNumber);
}
