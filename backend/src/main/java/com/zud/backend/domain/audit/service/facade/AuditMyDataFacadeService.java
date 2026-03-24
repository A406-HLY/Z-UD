package com.zud.backend.domain.audit.service.facade;

import com.zud.backend.domain.audit.dto.request.MyDataReqDto;
import com.zud.backend.domain.audit.dto.response.MyDataResDto;

public interface AuditMyDataFacadeService {
	MyDataResDto getMyData(final Long userId, final MyDataReqDto reqDto);
}
