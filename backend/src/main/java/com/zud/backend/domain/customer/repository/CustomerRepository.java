package com.zud.backend.domain.customer.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zud.backend.domain.customer.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
	Optional<Customer> findTopByCustomerNameOrderByIdDesc(String customerName);
}
