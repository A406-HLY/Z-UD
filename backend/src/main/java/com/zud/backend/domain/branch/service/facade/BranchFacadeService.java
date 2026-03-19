package com.zud.backend.domain.branch.service.facade;

import com.zud.backend.domain.branch.dto.response.NearestBranchResDto;

public interface BranchFacadeService {
	NearestBranchResDto findNearestBranch(final Long userId, final String propertyAddress);
}
