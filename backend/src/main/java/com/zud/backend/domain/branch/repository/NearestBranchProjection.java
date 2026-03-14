package com.zud.backend.domain.branch.repository;

public interface NearestBranchProjection {
	Long getId();

	String getName();

	String getFullAddress();

	Double getDistanceMeter();
}