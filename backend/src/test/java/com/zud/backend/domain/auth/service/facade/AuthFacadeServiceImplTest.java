package com.zud.backend.domain.auth.service.facade;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.zud.backend.domain.auth.dto.request.LoginReqDto;
import com.zud.backend.domain.auth.dto.response.LoginSuccessResDto;
import com.zud.backend.domain.auth.enums.SessionConstants;
import com.zud.backend.domain.auth.exception.AuthException;
import com.zud.backend.domain.auth.session.UserSession;
import com.zud.backend.domain.user.entity.Branch;
import com.zud.backend.domain.user.entity.User;
import com.zud.backend.domain.user.service.query.UserQueryService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthFacadeServiceImpl 단위 테스트")
class AuthFacadeServiceImplTest {

	private static final String ENCODED_PASSWORD = "$2a$encodedPassword";
	private static final String PLAIN_PASSWORD = "plainPassword";
	private static final String WRONG_PASSWORD = "wrongPassword";
	private static final String EMPLOYEE_NUMBER = "EMP001";
	@Mock
	private RedisTemplate<String, UserSession> sessionRedisTemplate;
	@Mock
	private PasswordEncoder passwordEncoder;
	@Mock
	private UserQueryService userQueryService;
	@InjectMocks
	private AuthFacadeServiceImpl authFacadeService;

	private User createDefaultUser() {
		Branch branch = Branch.builder()
			.id(1L)
			.name("세종")
			.build();
		return User.builder()
			.id(1L)
			.employeeNumber(EMPLOYEE_NUMBER)
			.name("홍길동")
			.password(ENCODED_PASSWORD)
			.branch(branch)
			.build();
	}

	@SuppressWarnings("unchecked")
	private ValueOperations<String, UserSession> stubSuccessfulLogin(User user) {
		ValueOperations<String, UserSession> valueOps = Mockito.mock(ValueOperations.class);
		given(userQueryService.findByEmployeeNumber(EMPLOYEE_NUMBER)).willReturn(user);
		given(passwordEncoder.matches(PLAIN_PASSWORD, ENCODED_PASSWORD)).willReturn(true);
		given(sessionRedisTemplate.opsForValue()).willReturn(valueOps);
		return valueOps;
	}

	@Nested
	@DisplayName("login()")
	class Login {

		@Test
		@DisplayName("로그인_성공시_응답_반환")
		void 로그인_성공_시_응답_반환() {
			// given
			LoginReqDto reqDto = new LoginReqDto(EMPLOYEE_NUMBER, PLAIN_PASSWORD);
			User user = createDefaultUser();
			HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
			stubSuccessfulLogin(user);

			// when
			LoginSuccessResDto result = authFacadeService.login(reqDto, response);

			// then
			assertThat(result).isNotNull();
			assertThat(result.userInfoDto().employeeNumber()).isEqualTo(EMPLOYEE_NUMBER);
			assertThat(result.userInfoDto().name()).isEqualTo("홍길동");
			assertThat(result.sessionExpiry()).isNotNull().isNotBlank();
		}

		@Test
		@DisplayName("로그인_성공시_세션_Redis_저장")
		void 로그인_성공시_세션_Redis_저장() {
			// given
			LoginReqDto reqDto = new LoginReqDto(EMPLOYEE_NUMBER, PLAIN_PASSWORD);
			User user = createDefaultUser();
			HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
			ValueOperations<String, UserSession> valueOps = stubSuccessfulLogin(user);

			// when
			authFacadeService.login(reqDto, response);

			// then
			ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
			ArgumentCaptor<UserSession> sessionCaptor = ArgumentCaptor.forClass(UserSession.class);
			then(valueOps).should().set(
				keyCaptor.capture(),
				sessionCaptor.capture(),
				eq((long)SessionConstants.EXPIRATION_HOUR_TIME),
				eq(TimeUnit.HOURS)
			);
			assertThat(keyCaptor.getValue()).startsWith(SessionConstants.PREFIX);
			assertThat(sessionCaptor.getValue().getUserId()).isEqualTo(1L);
		}

		@Test
		@DisplayName("로그인_성공시_응답에_세션_쿠키_추가")
		void 로그인_성공시_응답에_세션_쿠키_추가() {
			// given
			LoginReqDto reqDto = new LoginReqDto(EMPLOYEE_NUMBER, PLAIN_PASSWORD);
			User user = createDefaultUser();
			HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
			stubSuccessfulLogin(user);

			// when
			authFacadeService.login(reqDto, response);

			// then
			ArgumentCaptor<Cookie> cookieCaptor = ArgumentCaptor.forClass(Cookie.class);
			then(response).should().addCookie(cookieCaptor.capture());
			Cookie cookie = cookieCaptor.getValue();
			assertThat(cookie.getName()).isEqualTo(SessionConstants.PREFIX);
			assertThat(cookie.isHttpOnly()).isTrue();
			assertThat(cookie.getSecure()).isTrue();
			assertThat(cookie.getMaxAge()).isGreaterThan(0);
		}

		@Test
		@DisplayName("비밀번호_불일치시_AuthException_발생")
		void 비밀번호_불일치시_AuthException_발생() {
			// given
			LoginReqDto reqDto = new LoginReqDto(EMPLOYEE_NUMBER, WRONG_PASSWORD);
			User user = createDefaultUser();
			HttpServletResponse response = Mockito.mock(HttpServletResponse.class);

			given(userQueryService.findByEmployeeNumber(EMPLOYEE_NUMBER)).willReturn(user);
			given(passwordEncoder.matches(WRONG_PASSWORD, ENCODED_PASSWORD)).willReturn(false);

			// when & then
			assertThatThrownBy(() -> authFacadeService.login(reqDto, response)).isInstanceOf(AuthException.class);
		}
	}
}
