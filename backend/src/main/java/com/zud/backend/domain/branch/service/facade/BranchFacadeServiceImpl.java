package com.zud.backend.domain.branch.service.facade;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.domain.branch.client.AddressGeocodingClient;
import com.zud.backend.domain.branch.client.dto.CoordinateResultDto;
import com.zud.backend.domain.branch.converter.BranchConverter;
import com.zud.backend.domain.branch.dto.response.NearestBranchResDto;
import com.zud.backend.domain.branch.entity.Branch;
import com.zud.backend.domain.branch.repository.NearestBranchProjection;
import com.zud.backend.domain.branch.service.query.BranchQueryServiceImpl;
import com.zud.backend.domain.user.entity.User;
import com.zud.backend.domain.user.service.query.UserQueryService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BranchFacadeServiceImpl implements BranchFacadeService {

	private final UserQueryService userQueryService;
	private final AddressGeocodingClient addressGeocodingClient;
	private final BranchQueryServiceImpl branchQueryService;
	private final BranchConverter branchConverter;

	public NearestBranchResDto findNearestBranch(
		final Long userId, final String propertyAddress
	) {
		User user = userQueryService.findById(userId);
		Branch currentBranch = user.getBranch();

		CoordinateResultDto coordinate = addressGeocodingClient.getCoordinates(propertyAddress);

		NearestBranchProjection nearestBranch = branchQueryService.findNearestBranch(
			coordinate.longitude(),
			coordinate.latitude()
		);

		double currentBranchDistanceMeter = branchQueryService.calculateDistanceToBranch(
			currentBranch.getId(),
			coordinate.longitude(),
			coordinate.latitude()
		);

		return branchConverter.toNearestBranchResDto(
			currentBranch,
			currentBranchDistanceMeter,
			nearestBranch
		);

	}
}
