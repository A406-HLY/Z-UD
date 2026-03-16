package com.zud.backend.domain.audit.service.facade;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.domain.audit.converter.AuditConverter;
import com.zud.backend.domain.audit.dto.request.AuditReqDto;
import com.zud.backend.domain.audit.dto.response.AuditResDto;
import com.zud.backend.domain.branch.dto.response.NearestBranchResDto;
import com.zud.backend.domain.branch.service.facade.BranchFacadeService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Transactional(readOnly = true)
public class AuditFacadeServiceImpl implements AuditFacadeService {

	private final BranchFacadeService branchFacadeService;
	private final AuditConverter auditConverter;

	@Override
	public AuditResDto audit(final Long userId, final AuditReqDto reqDto) {
		NearestBranchResDto nearestBranch = branchFacadeService.findNearestBranch(userId, reqDto.nearestBranch());
		return auditConverter.toAuditResDto(nearestBranch);
	}
}

