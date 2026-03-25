package com.bank.auth.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;

import com.bank.auth.conveter.TokenConverter;
import com.bank.auth.dto.request.TokenIssueReqDto;
import com.bank.auth.dto.request.TokenRefreshReqDto;
import com.bank.auth.dto.request.TokenRevokeReqDto;
import com.bank.auth.dto.response.TokenIssueResDto;
import com.bank.auth.entity.AuditLog;
import com.bank.auth.enums.TokenAction;
import com.bank.auth.service.command.RefreshTokenCommandService;
import com.bank.auth.service.command.TokenBlacklistCommandService;
import com.bank.auth.service.query.RefreshTokenQueryService;
import com.bank.auth.service.query.TokenBlacklistQueryService;
import com.bank.common.config.propertie.OAuthProperties;
import com.bank.common.error.ErrorCode;
import com.bank.common.error.exception.BusinessException;
import com.bank.user.entity.User;
import com.bank.user.service.query.UserQueryService;

import io.micrometer.common.util.StringUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenService {

	private static final String ISSUER = "zud-auth";
	public static final String HTTP_HEADER_X_FORWARDED_FOR = "X-Forwarded-For";

	private final JwtEncoder jwtEncoder;
	private final JwtDecoder jwtDecoder;
	private final PasswordEncoder passwordEncoder;
	private final UserQueryService userQueryService;
	private final RefreshTokenCommandService refreshTokenCommandService;
	private final RefreshTokenQueryService refreshTokenQueryService;
	private final TokenBlacklistCommandService tokenBlacklistCommandService;
	private final TokenBlacklistQueryService tokenBlacklistQueryService;
	private final AuditLogService auditLogService;
	private final OAuthProperties oAuthProperties;

	public TokenIssueResDto issueToken(final TokenIssueReqDto reqDto, final HttpServletRequest servletRequest) {
		User user = userQueryService.findByEmployeeNumber(reqDto.employeeNumber());
		validatePassword(reqDto.password(), user.getPassword());

		long accessTtl = oAuthProperties.accessTokenTtl().toSeconds();
		long refreshTtl = oAuthProperties.refreshTokenTtl().toSeconds();

		String accessToken = encodeToken(user, UUID.randomUUID().toString(), accessTtl, "access");
		String refreshToken = encodeToken(user, UUID.randomUUID().toString(), refreshTtl, "refresh");
		refreshTokenCommandService.save(user.getEmployeeNumber(), refreshToken, refreshTtl);

		saveAuditLog(user.getEmployeeNumber(), TokenAction.TOKEN_ISSUE, extractIp(servletRequest));
		log.info("[Token] 토큰 발급 완료 - employeeNumber: {}", user.getEmployeeNumber());
		return TokenConverter.toTokenIssueResDto(accessToken, refreshToken, accessTtl, user);
	}

	public TokenIssueResDto reissueAccessToken(
		final TokenRefreshReqDto reqDto,
		final HttpServletRequest servletRequest
	) {
		Jwt refreshJwt = decodeAndValidateRefreshToken(reqDto.refreshToken());
		String employeeNumber = refreshJwt.getSubject();
		Long userId = refreshJwt.getClaim("userId");

		long accessTtl = oAuthProperties.accessTokenTtl().toSeconds();
		String newAccessToken = encodeTokenById(employeeNumber, userId, UUID.randomUUID().toString(), accessTtl, "access");

		saveAuditLog(employeeNumber, TokenAction.TOKEN_REFRESH, extractIp(servletRequest));
		log.info("[Token] 액세스 토큰 갱신 완료 - employeeNumber: {}", employeeNumber);
		return TokenConverter.toTokenIssueResDto(newAccessToken, reqDto.refreshToken(), accessTtl);
	}

	public void revokeToken(final TokenRevokeReqDto reqDto, final HttpServletRequest servletRequest) {
		Jwt jwt = decodeToken(reqDto.accessToken());
		String employeeNumber = jwt.getSubject();

		addToBlacklist(jwt, reqDto.reason());
		refreshTokenCommandService.deleteByEmployeeNumber(employeeNumber);

		saveAuditLog(employeeNumber, TokenAction.TOKEN_REVOKE, extractIp(servletRequest));
		log.info("[Token] 토큰 무효화 완료 - employeeNumber: {}, reason: {}", employeeNumber, reqDto.reason());
	}

	private void validatePassword(final String rawPassword, final String encodedPassword) {
		if (!passwordEncoder.matches(rawPassword, encodedPassword)) {
			throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
		}
	}

	private String encodeToken(final User user, final String jti, final long ttlSeconds, final String tokenType) {
		return encodeTokenById(user.getEmployeeNumber(), user.getId(), jti, ttlSeconds, tokenType);
	}

	private String encodeTokenById(
		final String employeeNumber,
		final Long userId,
		final String jti,
		final long ttlSeconds,
		final String tokenType
	) {
		Instant now = Instant.now();
		JwtClaimsSet claims = JwtClaimsSet.builder()
			.issuer(ISSUER)
			.subject(employeeNumber)
			.issuedAt(now)
			.expiresAt(now.plusSeconds(ttlSeconds))
			.id(jti)
			.claim("userId", userId)
			.claim("tokenType", tokenType)
			.build();
		return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
	}

	private Jwt decodeAndValidateRefreshToken(final String refreshToken) {
		Jwt jwt = decodeToken(refreshToken);
		String storedToken = refreshTokenQueryService.findTokenValueByEmployeeNumber(jwt.getSubject());
		if (!storedToken.equals(refreshToken)) {
			throw new BusinessException(ErrorCode.REFRESH_TOKEN_NOT_FOUND);
		}
		return jwt;
	}

	private void addToBlacklist(final Jwt jwt, final String reason) {
		Instant expiration = jwt.getExpiresAt();
		String jti = jwt.getId();
		if (expiration == null || jti == null) {
			return;
		}
		long ttlSeconds = expiration.getEpochSecond() - Instant.now().getEpochSecond();
		if (ttlSeconds > 0) {
			tokenBlacklistCommandService.save(jti, jwt.getSubject(), reason, ttlSeconds);
		}
	}

	private void saveAuditLog(final String employeeNumber, final TokenAction action, final String ipAddress) {
		auditLogService.save(AuditLog.create(employeeNumber, action, null, ipAddress, null, true));
	}

	private Jwt decodeToken(final String token) {
		try {
			return jwtDecoder.decode(token);
		} catch (JwtException _) {
			throw new BusinessException(ErrorCode.TOKEN_INVALID);
		}
	}

	private String extractIp(final HttpServletRequest request) {
		String ip = request.getHeader(HTTP_HEADER_X_FORWARDED_FOR);
		if (StringUtils.isEmpty(ip)) {
			ip = request.getRemoteAddr();
		}
		return ip;
	}
}
