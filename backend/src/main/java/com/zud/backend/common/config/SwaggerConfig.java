package com.zud.backend.common.config;

import java.util.Arrays;
import java.util.List;

import org.springdoc.core.models.GroupedOpenApi;
import org.springdoc.core.properties.SwaggerUiConfigProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import com.zud.backend.common.constant.BackDomain;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class SwaggerConfig {

	private static final String BEARER_AUTH_SCHEME = "BearerAuth";

	@Bean
	public OpenAPI customOpenApi() {

		List<Server> servers = Arrays.stream(BackDomain.values())
			.map(domain -> new Server()
				.url(domain.getUrl())
				.description(domain.getDescription()))
			.toList();

		SecurityScheme bearerAuth = new SecurityScheme()
			.type(SecurityScheme.Type.HTTP)
			.scheme("bearer")
			.bearerFormat("JWT")
			.description("로그인 후 Authorization 헤더에 설정되는 Access Token");

		return new OpenAPI()
			.info(new Info()
				.title("Z.UD API")
				.description("""
					Z.UD API 서버
					
					### 인증 방식
					1. 먼저 `/api/v1/auth/login` API로 로그인하세요.
					2. 로그인 성공 시 Access Token은 `Authorization` 헤더, Refresh Token은 HttpOnly 쿠키로 전달됩니다.
					3. 이후 API 호출 시 `Authorization: Bearer {accessToken}` 헤더를 포함하세요.""")
				.version("v1.0"))
			.servers(servers)
			.components(new Components()
				.addSecuritySchemes(BEARER_AUTH_SCHEME, bearerAuth))
			.addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH_SCHEME));
	}

	@Bean
	public GroupedOpenApi productionApi() {
		return GroupedOpenApi.builder()
			.group("1. Production APIs")
			.displayName("Production APIs (Requires Auth)")
			.pathsToMatch("/api/**")
			.pathsToExclude("/test/**")
			.build();
	}

	@Bean
	public GroupedOpenApi testApi() {
		return GroupedOpenApi.builder()
			.group("2. Test APIs")
			.displayName("Test APIs (No Auth Required)")
			.pathsToMatch("/test/**")
			.build();
	}

	@Bean
	@Primary
	public SwaggerUiConfigProperties swaggerUiConfigProperties(SwaggerUiConfigProperties props) {
		props.setPersistAuthorization(true);
		return props;
	}
}