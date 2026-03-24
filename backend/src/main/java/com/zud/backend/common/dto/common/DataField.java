package com.zud.backend.common.dto.common;

import java.util.List;

import lombok.Builder;

@Builder
public record DataField<T>(T value, Double confidence, Evidence evidence) {
	@Builder
	public record Evidence(Integer pageNum, List<Integer> bbox, String rawText, Double confidence) {
	}
}
