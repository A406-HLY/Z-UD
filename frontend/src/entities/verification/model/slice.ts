import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VerificationState } from './types';

const initialState: VerificationState = {
  edits: {},
  activeDocumentId: null,
};

export const verificationSlice = createSlice({
  name: 'verification',
  initialState,
  reducers: {

    updateField: (
      state,
      action: PayloadAction<{ docId: string; path: string; value: any }>
    ) => {
      const { docId, path, value } = action.payload;

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

    setActiveDocument: (state, action: PayloadAction<string>) => {
      state.activeDocumentId = action.payload;
    },

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