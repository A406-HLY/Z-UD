package com.zud.backend.domain.user.service.query;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.zud.backend.domain.user.entity.User;
import com.zud.backend.domain.user.exception.UserException;
import com.zud.backend.domain.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserQueryServiceImpl 단위 테스트")
class UserQueryServiceImplTest {

	@Mock
	private UserRepository userRepository;

	@InjectMocks
	private UserQueryServiceImpl userQueryService;

	private User createUser(Long id, String employeeNumber) {
		return User.builder()
			.id(id)
			.employeeNumber(employeeNumber)
			.name("홍길동")
			.password("$2a$encodedPassword")
			.build();
	}

	@Nested
	@DisplayName("findByEmployeeNumber()")
	class FindByEmployeeNumber {

		@Test
		@DisplayName("사번_존재시_User_반환")
		void 사번_존재시_User_반환() {
			// given
			String employeeNumber = "EMP001";
			User user = createUser(1L, employeeNumber);
			given(userRepository.findByEmployeeNumber(employeeNumber)).willReturn(Optional.of(user));

			// when
			User result = userQueryService.findByEmployeeNumber(employeeNumber);

			// then
			assertThat(result.getEmployeeNumber()).isEqualTo(employeeNumber);
			assertThat(result.getId()).isEqualTo(1L);
			then(userRepository).should().findByEmployeeNumber(employeeNumber);
		}

		@Test
		@DisplayName("사번_미존재시_UserException_발생")
		void 사번_미존재시_UserException_발생() {
			// given
			String employeeNumber = "INVALID";
			given(userRepository.findByEmployeeNumber(employeeNumber)).willReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> userQueryService.findByEmployeeNumber(employeeNumber))
				.isInstanceOf(UserException.class);
		}
	}

	@Nested
	@DisplayName("findById()")
	class FindById {

		@Test
		@DisplayName("아이디_존재시_User_반환")
		void 아이디_존재시_User_반환() {
			// given
			Long userId = 1L;
			User user = createUser(userId, "EMP001");
			given(userRepository.findById(userId)).willReturn(Optional.of(user));

			// when
			User result = userQueryService.findById(userId);

			// then
			assertThat(result.getId()).isEqualTo(userId);
			then(userRepository).should().findById(userId);
		}

		@Test
		@DisplayName("아이디_미존재시_UserException_발생")
		void 아이디_미존재시_UserException_발생() {
			// given
			Long userId = 999L;
			given(userRepository.findById(userId)).willReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> userQueryService.findById(userId))
				.isInstanceOf(UserException.class);
		}
	}
}
