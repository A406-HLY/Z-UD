package com.zud.backend.domain.audit.service.facade;

import com.zud.backend.domain.audit.dto.request.AuditHouseReqDto;
import com.zud.backend.domain.audit.dto.response.AuditHouseResDto;

public interface AuditHouseFacadeService {
	AuditHouseResDto auditHouse(final Long userId, final AuditHouseReqDto reqDto);
}

