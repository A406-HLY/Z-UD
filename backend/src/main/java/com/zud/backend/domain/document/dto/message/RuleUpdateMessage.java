package com.zud.backend.domain.document.dto.message;

import java.util.List;

public record RuleUpdateMessage(
	List<String> presignedUrls
) {
}
