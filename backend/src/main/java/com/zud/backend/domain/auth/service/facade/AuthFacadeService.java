package com.zud.backend.domain.auth.service.facade;

import com.zud.backend.domain.auth.dto.request.LoginReqDto;
import com.zud.backend.domain.auth.dto.response.LoginSuccessResDto;

import jakarta.servlet.http.HttpServletResponse;

public interface AuthFacadeService {
	LoginSuccessResDto login(final LoginReqDto reqDto, final HttpServletResponse httpServletResponse);
}
