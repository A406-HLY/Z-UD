package com.zud.backend.domain.branch.service.query;

import com.zud.backend.domain.branch.repository.NearestBranchProjection;

public interface BranchQueryService {
	NearestBranchProjection findNearestBranch(double longitude, double latitude);
	double calculateDistanceToBranch(Long branchId, double longitude, double latitude);
}
