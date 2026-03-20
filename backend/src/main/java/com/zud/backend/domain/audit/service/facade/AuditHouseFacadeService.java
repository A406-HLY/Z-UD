package com.zud.backend.domain.audit.service.facade;

import com.zud.backend.domain.audit.dto.request.AuditHouseReqDto;
import com.zud.backend.domain.audit.dto.request.MyDataReqDto;
import com.zud.backend.domain.audit.dto.response.AuditHouseResDto;
import com.zud.backend.domain.audit.dto.response.MyDataResDto;

public interface AuditHouseFacadeService {
	AuditHouseResDto auditHouse(final Long userId, final AuditHouseReqDto reqDto);
	MyDataResDto getMyData(final MyDataReqDto reqDto);
}

