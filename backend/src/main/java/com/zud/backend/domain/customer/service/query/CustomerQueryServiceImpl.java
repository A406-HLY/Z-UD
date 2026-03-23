package com.zud.backend.domain.customer.service.query;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.audit.exception.AuditException;
import com.zud.backend.domain.customer.entity.Customer;
import com.zud.backend.domain.customer.repository.CustomerRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class CustomerQueryServiceImpl implements CustomerQueryService {

	private final CustomerRepository customerRepository;

	@Override
	public String findCustomerEmailByCustomerName(final String customerName) {
		Customer customer = customerRepository.findTopByCustomerNameOrderByIdDesc(customerName)
			.orElseThrow(() -> new AuditException(ErrorCode.USER_NOT_FOUND));
		return customer.getCustomerEmail();
	}
}
