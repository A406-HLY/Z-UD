package com.zud.backend.domain.auth.service.facade;

import com.zud.backend.domain.auth.dto.request.LoginReqDto;
import com.zud.backend.domain.auth.dto.response.TokenIssueResDto;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthFacadeService {
	TokenIssueResDto login(final LoginReqDto reqDto, final HttpServletResponse servletResponse);

	TokenIssueResDto reissue(final HttpServletRequest servletRequest, final HttpServletResponse servletResponse);

	void logout(final HttpServletRequest servletRequest, final HttpServletResponse servletResponse);
}
