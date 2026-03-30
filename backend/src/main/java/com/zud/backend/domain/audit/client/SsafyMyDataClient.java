package com.zud.backend.domain.audit.client;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.zud.backend.domain.audit.config.SsafyApiProperties;
import com.zud.backend.domain.audit.dto.external.request.ExternalCreditRatingReqDto;
import com.zud.backend.domain.audit.dto.external.request.ExternalHeaderReqDto;
import com.zud.backend.domain.audit.dto.external.request.ExternalInquireLoanAccountListReqDto;
import com.zud.backend.domain.audit.dto.external.request.ExternalInquireRepaymentRecordsReqDto;
import com.zud.backend.domain.audit.dto.external.request.ExternalMemberSearchReqDto;
import com.zud.backend.domain.audit.dto.external.response.ExternalCreditRatingResDto;
import com.zud.backend.domain.audit.dto.external.response.ExternalInquireLoanAccountListResDto;
import com.zud.backend.domain.audit.dto.external.response.ExternalInquireRepaymentRecordsResDto;
import com.zud.backend.domain.audit.dto.external.response.ExternalMemberSearchResDto;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@EnableConfigurationProperties(SsafyApiProperties.class)
public class SsafyMyDataClient {

	private final DateTimeFormatter dateFormatter;
	private final DateTimeFormatter timeFormatter;
	private final RestClient restClient;
	private final SsafyApiProperties ssafyApiProperties;

	public SsafyMyDataClient(final SsafyApiProperties ssafyApiProperties) {
		this.ssafyApiProperties = ssafyApiProperties;
		this.dateFormatter = DateTimeFormatter.ofPattern(ssafyApiProperties.datePattern());
		this.timeFormatter = DateTimeFormatter.ofPattern(ssafyApiProperties.timePattern());
		this.restClient = RestClient.builder()
			.baseUrl(ssafyApiProperties.baseUrl())
			.build();
	}

	public ExternalMemberSearchResDto findMemberByEmail(final String email) {
		return restClient.post()
			.uri(ssafyApiProperties.memberPath())
			.body(new ExternalMemberSearchReqDto(email, ssafyApiProperties.apiKey()))
			.retrieve()
			.body(ExternalMemberSearchResDto.class);
	}

	public ExternalCreditRatingResDto inquireCreditRating(final String userKey) {
		return restClient.post()
			.uri(ssafyApiProperties.inquireCreditRatingPath())
			.body(new ExternalCreditRatingReqDto(createHeader(ssafyApiProperties.inquireCreditRatingPath(), userKey)))
			.retrieve()
			.body(ExternalCreditRatingResDto.class);
	}

	public ExternalInquireLoanAccountListResDto inquireLoanAccountList(final String userKey) {
		return restClient.post()
			.uri(ssafyApiProperties.inquireLoanAccountListPath())
			.body(new ExternalInquireLoanAccountListReqDto(
				createHeader(ssafyApiProperties.inquireLoanAccountListPath(), userKey)))
			.retrieve()
			.body(ExternalInquireLoanAccountListResDto.class);
	}

	public ExternalInquireRepaymentRecordsResDto inquireRepaymentRecords(
		final String userKey,
		final String accountNo
	) {
		return restClient.post()
			.uri(ssafyApiProperties.inquireRepaymentRecordsPath())
			.body(new ExternalInquireRepaymentRecordsReqDto(
				createHeader(ssafyApiProperties.inquireRepaymentRecordsPath(), userKey),
				accountNo
			))
			.retrieve()
			.body(ExternalInquireRepaymentRecordsResDto.class);
	}

	private ExternalHeaderReqDto createHeader(final String path, final String userKey) {
		LocalDateTime now = LocalDateTime.now();
		String apiName = extractLastPathSegment(path);
		return new ExternalHeaderReqDto(
			apiName,
			now.format(dateFormatter),
			now.format(timeFormatter),
			ssafyApiProperties.institutionCode(),
			ssafyApiProperties.fintechAppNo(),
			apiName,
			createUniqueNo(),
			ssafyApiProperties.apiKey(),
			userKey
		);
	}

	private String extractLastPathSegment(final String path) {
		int lastSlashIndex = path.lastIndexOf("/");
		if (lastSlashIndex < 0 || lastSlashIndex == path.length() - 1) {
			return path;
		}
		return path.substring(lastSlashIndex + 1);
	}

	private String createUniqueNo() {
		LocalDateTime now = LocalDateTime.now();
		String date = now.format(dateFormatter);
		String time = now.format(timeFormatter);
		int random = java.util.concurrent.ThreadLocalRandom.current().nextInt(100000, 1000000);
		return date + time + random;
	}
}
