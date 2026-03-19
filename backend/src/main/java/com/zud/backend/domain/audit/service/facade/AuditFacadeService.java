package com.zud.backend.domain.audit.service.facade;

import com.zud.backend.domain.audit.dto.request.AuditReqDto;
import com.zud.backend.domain.audit.dto.response.AuditResDto;

public interface AuditFacadeService {
	AuditResDto auditHouse(final Long userId, final AuditReqDto reqDto);
}

