import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VerificationState } from './types';

const initialState: VerificationState = {
  edits: {},
  activeDocumentId: null,
};

/**
 * [WHY: OCR 검증 도메인의 전역 상태를 관리합니다.]
 * 1. Hybrid State: 원본 데이터는 TanStack Query에서, 수정본은 Redux에서 관리합니다.
 * 2. Flat Key: 중첩된 JSON 구조 대신 점 표기법(Dot Notation) 경로를 키로 사용하여 업데이트 성능을 최적화합니다.
 */
export const verificationSlice = createSlice({
  name: 'verification',
  initialState,
  reducers: {
    /** 
     * 특정 문서의 특정 필드 값을 수정합니다. 
     * @param payload.docId - 수정 대상 문서 고유 ID
     * @param payload.path - 평탄화된 필드 경로 (예: "userInfo.name")
     * @param payload.value - 변경할 값
     */
    updateField: (
      state,
      action: PayloadAction<{ docId: string; path: string; value: any }>
    ) => {
      const { docId, path, value } = action.payload;

      // 해당 문서의 에딧 컨텍스트가 없으면 초기화
      if (!state.edits[docId]) {
        state.edits[docId] = {
          values: {},
          lastModified: new Date().toISOString(),
        };
      }

      const docEdits = state.edits[docId];
      docEdits.values[path] = value;
      docEdits.lastModified = new Date().toISOString();
    },

    /** 현재 활성화된 문서 ID를 변경합니다. */
    setActiveDocument: (state, action: PayloadAction<string>) => {
      state.activeDocumentId = action.payload;
    },

    /** 
     * 수정 내역을 초기화합니다. 
     * docId가 있으면 해당 문서만, 없으면 전체 초기화합니다.
     */
    resetVerification: (state, action: PayloadAction<{ docId?: string } | undefined>) => {
      if (action.payload?.docId) {
        delete state.edits[action.payload.docId];
      } else {
        state.edits = {};
        state.activeDocumentId = null;
      }
    },
  },
});

export const { updateField, setActiveDocument, resetVerification } = verificationSlice.actions;
export default verificationSlice.reducer;
