package com.zud.backend.domain.branch.service.query;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.common.error.ErrorCode;
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
		return branchRepository.findNearestBranch(longitude, latitude)
			.orElseThrow(() -> new BranchException(ErrorCode.BRANCH_NOT_FOUND));
	}

	@Override
	public double calculateDistanceToBranch(Long branchId, double longitude, double latitude) {
		return branchRepository.calculateDistanceToBranch(branchId, longitude, latitude)
			.orElseThrow(() -> new BranchException(ErrorCode.BRANCH_NOT_FOUND));
	}
}
