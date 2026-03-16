import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * 프로젝트 전역에서 사용할 (타입이 지정된) Redux Hook
 *
 * - 컴포넌트에서는 일반 useDispatch, useSelector 대신 useDispatchApp, useAppSelector를 사용하세요.
 */
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
