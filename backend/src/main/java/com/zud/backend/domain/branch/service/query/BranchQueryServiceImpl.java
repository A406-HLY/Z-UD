package com.zud.backend.domain.branch.service.query;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.branch.entity.Branch;
import com.zud.backend.domain.branch.exception.BranchException;
import com.zud.backend.domain.branch.repository.BranchRepository;
import com.zud.backend.domain.branch.repository.NearestBranchProjection;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Transactional(readOnly = true)
public class BranchQueryServiceImpl implements BranchQueryService {

	private final BranchRepository branchRepository;

	@Override
	public NearestBranchProjection findNearestBranch(double longitude, double latitude) {
		NearestBranchProjection nearestBranch =  branchRepository.findNearestBranch(longitude, latitude)
			.orElseThrow(() -> new BranchException(ErrorCode.BRANCH_NOT_FOUND));

		log.info(
			"[Branch] 가장 가까운 지점 조회 성공 - longitude: {}, latitude: {}, branchId: {}, branchName: {}, distanceMeter: {}",
			longitude,
			latitude,
			nearestBranch.getId(),
			nearestBranch.getName(),
			nearestBranch.getDistanceMeter()
		);

		return nearestBranch;
	}

	@Override
	public Branch findById(final Long branchId) {
		return branchRepository.findById(branchId)
			.orElseThrow(() -> new BranchException(ErrorCode.BRANCH_NOT_FOUND));
	}

	@Override
	public double calculateDistanceToBranch(Long branchId, double longitude, double latitude) {
		double distance = branchRepository.calculateDistanceToBranch(branchId, longitude, latitude)
			.orElseThrow(() -> new BranchException(ErrorCode.BRANCH_NOT_FOUND));

		log.info(
			"[Branch] 지점 거리 계산 성공 - branchId: {}, longitude: {}, latitude: {}, distanceMeter: {}",
			branchId,
			longitude,
			latitude,
			distance
		);

		return distance;
	}
}
