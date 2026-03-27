package com.zud.backend.domain.auth.service.facade;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.auth.client.AuthServerClient;
import com.zud.backend.domain.auth.dto.request.LoginReqDto;
import com.zud.backend.domain.auth.dto.response.SsoTokenResDto;
import com.zud.backend.domain.auth.dto.response.TokenIssueResDto;
import com.zud.backend.domain.auth.exception.AuthException;
import com.zud.backend.domain.branch.entity.Branch;
import com.zud.backend.domain.branch.service.query.BranchQueryService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthFacadeServiceImpl 단위 테스트")
class AuthFacadeServiceImplTest {

	private static final String EMPLOYEE_NUMBER = "EMP001";
	private static final String PLAIN_PASSWORD = "plainPassword";
	private static final String MOCK_ACCESS_TOKEN = "mock-access-token";
	private static final String MOCK_REFRESH_TOKEN = "mock-refresh-token";
	private static final Long MOCK_EXPIRES_IN = 3600L;
	private static final Long MOCK_USER_ID = 1L;
	private static final String MOCK_USER_NAME = "홍길동";
	private static final Long MOCK_BRANCH_ID = 1L;
	private static final String MOCK_BRANCH_NAME = "세종";

	@Mock
	private AuthServerClient authServerClient;
	@Mock
	private BranchQueryService branchQueryService;
	@InjectMocks
	private AuthFacadeServiceImpl authFacadeService;

	private SsoTokenResDto createMockTokenResponse() {
		return SsoTokenResDto.builder()
			.accessToken(MOCK_ACCESS_TOKEN)
			.refreshToken(MOCK_REFRESH_TOKEN)
			.expiresIn(MOCK_EXPIRES_IN)
			.userId(MOCK_USER_ID)
			.name(MOCK_USER_NAME)
			.employeeNumber(EMPLOYEE_NUMBER)
			.branchId(MOCK_BRANCH_ID)
			.build();
	}

	private Branch createDefaultBranch() {
		return Branch.builder()
			.id(MOCK_BRANCH_ID)
			.name(MOCK_BRANCH_NAME)
			.build();
	}

	private void stubSuccessfulLogin() {
		LoginReqDto reqDto = new LoginReqDto(EMPLOYEE_NUMBER, PLAIN_PASSWORD);
		SsoTokenResDto tokenResponse = createMockTokenResponse();
		Branch branch = createDefaultBranch();

		given(authServerClient.issueToken(reqDto)).willReturn(tokenResponse);
		given(branchQueryService.findById(MOCK_BRANCH_ID)).willReturn(branch);
	}

	@Nested
	@DisplayName("login()")
	class Login {

		@Test
		@DisplayName("로그인_성공시_Jwt_토큰_응답_반환")
		void 로그인_성공시_Jwt_토큰_응답_반환() {
			// given
			LoginReqDto reqDto = new LoginReqDto(EMPLOYEE_NUMBER, PLAIN_PASSWORD);
			HttpServletResponse servletResponse = mock(HttpServletResponse.class);
			stubSuccessfulLogin();

			// when
			TokenIssueResDto result = authFacadeService.login(reqDto, servletResponse);

			// then
			assertThat(result).isNotNull();
			assertThat(result.userInfoDto().employeeNumber()).isEqualTo(EMPLOYEE_NUMBER);
			assertThat(result.userInfoDto().name()).isEqualTo(MOCK_USER_NAME);
			assertThat(result.branchInfoDto().name()).isEqualTo(MOCK_BRANCH_NAME);
			assertThat(result.expiresIn()).isEqualTo(MOCK_EXPIRES_IN);
		}

		@Test
		@DisplayName("로그인_성공시_AuthServerClient_토큰_발급_호출")
		void 로그인_성공시_AuthServerClient_토큰_발급_호출() {
			// given
			LoginReqDto reqDto = new LoginReqDto(EMPLOYEE_NUMBER, PLAIN_PASSWORD);
			HttpServletResponse servletResponse = mock(HttpServletResponse.class);
			stubSuccessfulLogin();

			// when
			authFacadeService.login(reqDto, servletResponse);

			// then
			then(authServerClient).should().issueToken(reqDto);
		}

		@Test
		@DisplayName("로그인_성공시_Authorization_헤더와_RefreshToken_쿠키_설정")
		void 로그인_성공시_Authorization_헤더와_RefreshToken_쿠키_설정() {
			// given
			LoginReqDto reqDto = new LoginReqDto(EMPLOYEE_NUMBER, PLAIN_PASSWORD);
			HttpServletResponse servletResponse = mock(HttpServletResponse.class);
			stubSuccessfulLogin();

			// when
			authFacadeService.login(reqDto, servletResponse);

			// then
			then(servletResponse).should().setHeader("Authorization", "Bearer " + MOCK_ACCESS_TOKEN);
			then(servletResponse).should().addHeader(
				org.mockito.ArgumentMatchers.eq(org.springframework.http.HttpHeaders.SET_COOKIE),
				org.mockito.ArgumentMatchers.contains("refreshToken=" + MOCK_REFRESH_TOKEN)
			);
		}

		@Test
		@DisplayName("authServerClient_예외시_AuthException_전파")
		void authServerClient_예외시_AuthException_전파() {
			// given
			LoginReqDto reqDto = new LoginReqDto(EMPLOYEE_NUMBER, PLAIN_PASSWORD);
			HttpServletResponse servletResponse = mock(HttpServletResponse.class);

			given(authServerClient.issueToken(reqDto))
				.willThrow(new AuthException(ErrorCode.AUTH_SERVER_ERROR));

			// when & then
			assertThatThrownBy(() -> authFacadeService.login(reqDto, servletResponse))
				.isInstanceOf(AuthException.class);
		}
	}

	@Nested
	@DisplayName("logout()")
	class Logout {

		@Test
		@DisplayName("authorization_헤더_존재시_토큰_무효화_호출")
		void authorization_헤더_존재시_토큰_무효화_호출() {
			// given
			HttpServletRequest servletRequest = mock(HttpServletRequest.class);
			HttpServletResponse servletResponse = mock(HttpServletResponse.class);
			given(servletRequest.getHeader("Authorization")).willReturn("Bearer " + MOCK_ACCESS_TOKEN);

			// when
			authFacadeService.logout(servletRequest, servletResponse);

			// then
			then(authServerClient).should().revokeToken(MOCK_ACCESS_TOKEN, "USER_LOGOUT");
			then(servletResponse).should().addHeader(
				org.mockito.ArgumentMatchers.eq(org.springframework.http.HttpHeaders.SET_COOKIE),
				org.mockito.ArgumentMatchers.contains("Max-Age=0")
			);
		}

		@Test
		@DisplayName("authorization_헤더_없어도_RefreshToken_쿠키_만료")
		void authorization_헤더_없어도_RefreshToken_쿠키_만료() {
			// given
			HttpServletRequest servletRequest = mock(HttpServletRequest.class);
			HttpServletResponse servletResponse = mock(HttpServletResponse.class);
			given(servletRequest.getHeader("Authorization")).willReturn(null);

			// when
			authFacadeService.logout(servletRequest, servletResponse);

			// then
			then(authServerClient).shouldHaveNoInteractions();
			then(servletResponse).should().addHeader(
				org.mockito.ArgumentMatchers.eq(org.springframework.http.HttpHeaders.SET_COOKIE),
				org.mockito.ArgumentMatchers.contains("refreshToken=")
			);
		}
	}
}
