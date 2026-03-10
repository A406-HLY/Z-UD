package com.backend.zud.common.config;

import java.util.Arrays;
import java.util.List;

import org.springdoc.core.models.GroupedOpenApi;
import org.springdoc.core.properties.SwaggerUiConfigProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import com.backend.zud.common.constant.BackDomain;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class SwaggerConfig {

	@Bean
	public OpenAPI customOpenApi() {

		List<Server> servers = Arrays.stream(BackDomain.values())
			.map(domain -> new Server()
				.url(domain.getUrl())
				.description(domain.getDescription()))
			.toList();

		return new OpenAPI()
			.info(new Info().title("Z.UD API")
				.description("Z.UD API 서버")
				.version("v1.0"))
			.servers(servers);
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