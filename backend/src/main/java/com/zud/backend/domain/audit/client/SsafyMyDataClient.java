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

	private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
	private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HHmmss");
	private static final String INSTITUTION_CODE = "00100";
	private static final String FINTECH_APP_NO = "001";
	private static final String MEMBER_PATH = "/member/search";
	private static final String INQUIRE_CREDIT_RATING_PATH = "/edu/loan/inquireMyCreditRating";
	private static final String INQUIRE_LOAN_ACCOUNT_LIST_PATH = "/edu/loan/inquireLoanAccountList";
	private static final String INQUIRE_REPAYMENT_RECORDS_PATH = "/edu/loan/inquireRepaymentRecords";

	private final RestClient restClient;
	private final SsafyApiProperties ssafyApiProperties;

	public SsafyMyDataClient(final SsafyApiProperties ssafyApiProperties) {
		this.ssafyApiProperties = ssafyApiProperties;
		this.restClient = RestClient.builder()
			.baseUrl(ssafyApiProperties.baseUrl())
			.build();
	}

	public ExternalMemberSearchResDto findMemberByEmail(final String email) {
		return restClient.post()
			.uri(MEMBER_PATH)
			.body(new ExternalMemberSearchReqDto(email, ssafyApiProperties.apiKey()))
			.retrieve()
			.body(ExternalMemberSearchResDto.class);
	}

	public ExternalCreditRatingResDto inquireCreditRating(final String userKey) {
		return restClient.post()
			.uri(INQUIRE_CREDIT_RATING_PATH)
			.body(new ExternalCreditRatingReqDto(createHeader(INQUIRE_CREDIT_RATING_PATH, userKey)))
			.retrieve()
			.body(ExternalCreditRatingResDto.class);
	}

	public ExternalInquireLoanAccountListResDto inquireLoanAccountList(final String userKey) {
		return restClient.post()
			.uri(INQUIRE_LOAN_ACCOUNT_LIST_PATH)
			.body(new ExternalInquireLoanAccountListReqDto(createHeader(INQUIRE_LOAN_ACCOUNT_LIST_PATH, userKey)))
			.retrieve()
			.body(ExternalInquireLoanAccountListResDto.class);
	}

	public ExternalInquireRepaymentRecordsResDto inquireRepaymentRecords(
		final String userKey,
		final String accountNo
	) {
		return restClient.post()
			.uri(INQUIRE_REPAYMENT_RECORDS_PATH)
			.body(new ExternalInquireRepaymentRecordsReqDto(
				createHeader(INQUIRE_REPAYMENT_RECORDS_PATH, userKey),
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
			now.format(DATE_FORMATTER),
			now.format(TIME_FORMATTER),
			INSTITUTION_CODE,
			FINTECH_APP_NO,
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
		String date = now.format(DATE_FORMATTER);
		String time = now.format(TIME_FORMATTER);
		int random = java.util.concurrent.ThreadLocalRandom.current().nextInt(100000, 1000000);
		return date + time + random;
	}
}
