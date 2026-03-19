package com.zud.backend.domain.branch.converter;

import com.zud.backend.domain.branch.dto.response.NearestBranchResDto;
import com.zud.backend.domain.branch.entity.Branch;
import com.zud.backend.domain.branch.repository.NearestBranchProjection;
import lombok.experimental.UtilityClass;

@UtilityClass
public class BranchConverter {

	private static final String CURRENT_BRANCH_IS_NEAREST_MESSAGE =
		"현재 근무 지점이 해당 건물과 가장 가까운 지점입니다.";
	private static final String CURRENT_BRANCH_IS_NOT_NEAREST_MESSAGE =
		"현재 근무 지점은 해당 건물과 가장 가까운 지점이 아닙니다.";

	public NearestBranchResDto toNearestBranchResDto(
		Branch curBranch,
		double curBranchDistanceMeter,
		NearestBranchProjection nearestBranch
	) {
		boolean curBranchIsNearest = curBranch.getId().equals(nearestBranch.getId());

		String message = curBranchIsNearest
			? CURRENT_BRANCH_IS_NEAREST_MESSAGE
			: CURRENT_BRANCH_IS_NOT_NEAREST_MESSAGE;

		return new NearestBranchResDto(
			curBranchIsNearest,
			curBranch.getName(),
			curBranch.getFullAddress(),
			curBranchDistanceMeter,
			nearestBranch.getName(),
			nearestBranch.getFullAddress(),
			nearestBranch.getDistanceMeter(),
			message
		);
	}

}
