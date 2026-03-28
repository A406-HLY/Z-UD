import { useEffect, useCallback } from 'react';

/**
 * @feature verification
 * 브라우저의 BroadcastChannel API를 사용하여 서로 다른 창(Main <-> Viewer) 간의 
 * PDF 뷰어 상태를 실시간으로 동기화하는 훅입니다.
 */

export const VIEWER_SYNC_CHANNEL = 'ocr-viewer-sync';

interface SyncMessage {
  type: 'SYNC_STATE';
  payload: {
    selectedId?: string | null;
    pageNumber?: number;
    scale?: number;
    focusedFieldKey?: string | null;
  };
}

interface SyncParams {
  role: 'sender' | 'receiver';
  state?: {
    selectedId?: string | null;
    pageNumber?: number;
    scale?: number;
    focusedFieldKey?: string | null;
  };
  onSync?: (payload: SyncMessage['payload']) => void;
}

export const useCrossWindowSync = ({ role, state, onSync }: SyncParams) => {
  useEffect(() => {
    const channel = new BroadcastChannel(VIEWER_SYNC_CHANNEL);

    if (role === 'sender' && state) {
      // (Why: 상태가 변경될 때마다 다른 창으로 메시지를 발송합니다.)
      channel.postMessage({
        type: 'SYNC_STATE',
        payload: state
      });
    }

    if (role === 'receiver') {
      // (Why: 다른 창에서 보낸 메시지를 수신하여 로컬 상태를 업데이트합니다.)
      channel.onmessage = (event: MessageEvent<SyncMessage>) => {
        if (event.data.type === 'SYNC_STATE') {
          onSync?.(event.data.payload);
        }
      };
    }

    return () => {
      channel.close();
    };
  }, [role, state, onSync]);

  const manualSync = useCallback((payload: SyncMessage['payload']) => {
    const channel = new BroadcastChannel(VIEWER_SYNC_CHANNEL);
    channel.postMessage({
      type: 'SYNC_STATE',
      payload
    });
    channel.close();
  }, []);

  return { manualSync };
};
