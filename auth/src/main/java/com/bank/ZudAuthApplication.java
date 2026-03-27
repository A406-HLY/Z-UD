package com.bank;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.bank.common.config.propertie.OAuthProperties;

@SpringBootApplication
@EnableConfigurationProperties(OAuthProperties.class)
public class ZudAuthApplication {

	public static void main(String[] args) {
		SpringApplication.run(ZudAuthApplication.class, args);
	}

}
