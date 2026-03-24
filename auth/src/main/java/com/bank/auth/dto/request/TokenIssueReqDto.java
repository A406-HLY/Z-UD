package com.bank.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Schema(description = "토큰 발급 요청 DTO")
@Builder
public record TokenIssueReqDto(
	@Schema(description = "사원 번호", example = "EMP001")
	@NotBlank(message = "사원 번호는 필수 입력값입니다.")
	String employeeNumber,

	@Schema(description = "사용자 ID", example = "1")
	@NotNull(message = "사용자 ID는 필수 입력값입니다.")
	Long userId,

	@Schema(description = "사용자 이름", example = "홍길동")
	@NotBlank(message = "사용자 이름은 필수 입력값입니다.")
	String name,

	@Schema(description = "지점 ID", example = "1")
	Long branchId,

	@Schema(description = "지점명", example = "강남지점")
	String branchName
) {
}
