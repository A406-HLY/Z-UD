package com.zud.backend.domain.auth.session;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class UserSession {
	private Long userId;

	public static UserSession create(final Long userId) {
		return new UserSession(userId);
	}
}
