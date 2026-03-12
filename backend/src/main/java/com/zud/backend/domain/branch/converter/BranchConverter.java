package com.zud.backend.domain.branch.converter;

import org.springframework.stereotype.Component;

import com.zud.backend.domain.branch.dto.response.NearestBranchResDto;
import com.zud.backend.domain.branch.entity.Branch;
import com.zud.backend.domain.branch.repository.NearestBranchProjection;

@Component
public class BranchConverter {

	public NearestBranchResDto toNearestBranchResDto(
		Branch curBranch,
		double curBranchDistanceMeter,
		NearestBranchProjection nearestBranch
	) {
		boolean curBranchIsNearest = curBranch.getId().equals(nearestBranch.getId());

		String message = curBranchIsNearest
			? "현재 근무 지점이 해당 건물과 가장 가까운 지점입니다."
			: "현재 근무 지점은 해당 건물과 가장 가까운 지점이 아닙니다.";

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
