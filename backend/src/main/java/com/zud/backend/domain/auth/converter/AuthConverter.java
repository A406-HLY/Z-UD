package com.zud.backend.domain.auth.converter;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

import com.zud.backend.domain.auth.dto.response.LoginSuccessResDto;
import com.zud.backend.domain.auth.enums.SessionConstants;
import com.zud.backend.domain.user.converter.UserConverter;
import com.zud.backend.domain.user.entity.User;

import lombok.experimental.UtilityClass;

@UtilityClass
public class AuthConverter {

	public LoginSuccessResDto toLoginSuccessDto(final User user) {
		return LoginSuccessResDto.builder()
			.userInfoDto(UserConverter.toUserInfoDto(user))
			.branchInfoDto(UserConverter.toBranchInfoDto(user))
			.sessionExpiry(ZonedDateTime.now(ZoneId.of("Asia/Seoul"))
				.plusHours(SessionConstants.EXPIRATION_HOUR_TIME)
				.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME))
			.build();
	}
}
