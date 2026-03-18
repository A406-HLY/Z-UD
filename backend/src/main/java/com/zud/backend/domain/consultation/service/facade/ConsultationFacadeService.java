package com.zud.backend.domain.consultation.service.facade;

import com.zud.backend.domain.consultation.dto.request.CustomerInfoReqDto;
import com.zud.backend.domain.consultation.dto.response.CustomerInfoResDto;

public interface ConsultationFacadeService {
	CustomerInfoResDto register(Long userId, CustomerInfoReqDto reqDto);
}
