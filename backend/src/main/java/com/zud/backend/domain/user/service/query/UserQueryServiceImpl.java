package com.zud.backend.domain.user.service.query;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.user.entity.User;
import com.zud.backend.domain.user.exception.UserException;
import com.zud.backend.domain.user.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class UserQueryServiceImpl implements UserQueryService {

	private final UserRepository userRepository;

	@Override
	public User findByEmployeeNumber(final String employeeNumber) {
		User user = userRepository.findByEmployeeNumber(employeeNumber)
			.orElseThrow(() -> new UserException(ErrorCode.USER_NOT_FOUND));
		log.info("[User] 회원 조회 성공 - employeeNumber: {}", employeeNumber);
		return user;
	}

	@Override
	public User findById(final Long userId) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new UserException(ErrorCode.USER_NOT_FOUND));
		log.info("[User] 회원 조회 성공 - userId: {}", userId);
		return user;
	}
}
