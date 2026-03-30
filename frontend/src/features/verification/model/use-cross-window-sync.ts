import { useEffect, useCallback } from 'react';

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
      channel.postMessage({
        type: 'SYNC_STATE',
        payload: state
      });
    }

    if (role === 'receiver') {
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