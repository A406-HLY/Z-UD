package com.zud.backend.domain.document.dto.request.content;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.zud.backend.domain.document.enums.DocumentTag;

public interface DocumentContent {

    @JsonIgnore
    DocumentTag getDocumentTag();
}
