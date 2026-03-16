package com.zud.backend.domain.audit.converter;

import org.springframework.stereotype.Component;

import com.zud.backend.domain.audit.dto.response.AuditResDto;
import com.zud.backend.domain.branch.dto.response.NearestBranchResDto;

@Component
public class AuditConverter {

	public AuditResDto toAuditResDto(final NearestBranchResDto nearestBranch) {
		return AuditResDto.builder()
			.nearestBranch(nearestBranch)
			.build();
	}
}

