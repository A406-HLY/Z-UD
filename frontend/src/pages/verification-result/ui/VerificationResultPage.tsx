import { useState, useEffect } from 'react';
import { Header } from '@/widgets/header';
import { LoanTabs } from '@/widgets/loan-tabs';
import { CustomerInfoForm } from '@/widgets/customer-info-form';
import { VerificationRepository } from '@/widgets/verification-repository/ui/VerificationRepository';
import { OcrFieldEditor } from '@/widgets/ocr-field-editor/ui/OcrFieldEditor';
import { DocumentImageViewer } from '@/widgets/document-image-viewer/ui/DocumentImageViewer';
import { useVerificationQuery } from '@/features/verification/api/use-verification-query';
import { mapServerResponseToVerificationResult } from '@/entities/verification/model/verification.mapper';
import { VerificationResult } from '@/entities/verification/model/types';
import { useAppSelector } from '@/app/store/hooks';

/**
 * @page verification-result
 * 서류 검증 결과 및 OCR 교정을 수행하는 업무 페이지입니다.
 */
export const VerificationResultPage = () => {
  const [selectedId, setSelectedId] = useState('item-1');
  const [localResult, setLocalResult] = useState<VerificationResult | null>(null);
  
  // 1. Redux에서 전역 고객 원천 데이터(기준 정답) 가져오기
  const customerInfo = useAppSelector(state => state.customer.data);
  
  const { data: serverResponse, isLoading } = useVerificationQuery('v-12345');

  useEffect(() => {
    if (serverResponse) {
      const initialResult = mapServerResponseToVerificationResult(serverResponse, 'v-12345');
      setLocalResult(initialResult);
      setSelectedId(initialResult.selectedDocId);
    }
  }, [serverResponse]);

  /** 
   * 실시간 정합성 판정 핸들러 
   * (Why: Redux 고객 정보 대조 및 서류 간 상호 대조를 분기하여 연쇄적으로 오류 상태 해제)
   */
  const handleFieldChange = (key: string, value: string) => {
    if (!localResult) return;

    setLocalResult(prev => {
      if (!prev) return null;
      
      const newDocumentFields = { ...prev.documentFields };
      
      // 배열 키 정규화 (예: householdMembers[0]_name -> name)
      const baseKey = key.replace(/\[\d+\]/g, '').split('_').pop() || key;

      // 단계 1: 대조 결과(isResolved) 판정
      let isResolved = false;

      // 분기 A: 고객 정보(Redux)와 대조
      // OCR 키와 Redux 키가 다를 수 있으므로 매핑 처리 (예: residentRegistrationNumber -> personalId)
      if (baseKey === 'name' || baseKey === 'residentRegistrationNumber' || baseKey === 'phoneNumber') {
        const customerValue = 
          baseKey === 'name' ? customerInfo.name : 
          baseKey === 'residentRegistrationNumber' ? customerInfo.personalId : 
          customerInfo.phoneNumber;
        
        isResolved = customerValue === value;
      } 
      // 분기 B: 서류 간 상호 대조 (고객 정보가 아닌 일반 데이터)
      else {
        // 이 키(baseKey)로 위반(Violation)이 걸린 모든 서류들의 '현재 값'들을 수집하여 All-Match 검사
        const targetDocIds = prev.errorTargetDict[key] || new Set();
        const collectedValues = new Set<string>();
        
        targetDocIds.forEach(docId => {
           // 방금 수정한 문서라면 새 값을, 아니면 기존 값을 수집
           if (docId === selectedId) {
             collectedValues.add(value);
           } else {
             const field = newDocumentFields[docId]?.find(f => f.key === key);
             if (field && field.value !== null) collectedValues.add(String(field.value));
           }
        });

        // 1. 수집된 값이 1개뿐이다 (모든 타겟 문서의 값이 동일해짐)
        // 2. 그리고 그 값이 빈 값이 아니다
        isResolved = collectedValues.size === 1 && !collectedValues.has("");
      }

      // 단계 2: 연쇄 업데이트 (Cascading Update)
      // 해당 키를 가진 '모든' 타겟 문서 필드의 isMatch 상태를 일괄 변경
      const targetDocIdsToUpdate = prev.errorTargetDict[key] || new Set([selectedId]);
      
      targetDocIdsToUpdate.forEach(docId => {
        if (newDocumentFields[docId]) {
          newDocumentFields[docId] = newDocumentFields[docId].map(f => {
            if (f.key === key) {
              return { 
                ...f, 
                value: docId === selectedId ? value : f.value, // 수정한 문서만 값 변경
                isMatch: isResolved,                           // 판정 결과 일괄 적용
                isModified: docId === selectedId ? true : f.isModified
              };
            }
            return f;
          });
        }
      });

      // 단계 3: 카테고리/문서 상태 재평가 (좌측 트리 시각화 업데이트용)
      const updatedCategories = prev.categories.map(cat => ({
        ...cat,
        items: cat.items.map(item => {
          if (targetDocIdsToUpdate.has(item.id)) {
            const hasMismatch = newDocumentFields[item.id]?.some(f => !f.isMatch);
            const newStatus: "REVIEW_NEEDED" | "RISK" | "APPROVED" = hasMismatch ? 'REVIEW_NEEDED' : item.isRisk ? 'RISK' : 'APPROVED';
            return {
              ...item,
              status: newStatus
            };
          }
          return item;
        })
      }));

      return {
        ...prev,
        documentFields: newDocumentFields,
        categories: updatedCategories
      };
    });
  };

  if (isLoading || !localResult) {

    return (
      <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
        <Header />
        <main className="flex-1 p-4 space-y-4">
          <section><CustomerInfoForm /></section>
          <section><LoanTabs /></section>
          <div className="flex-1 flex items-center justify-center font-black text-gray-300 animate-pulse uppercase tracking-[0.5em] py-20">
            Analyzing Document Consistency...
          </div>
        </main>
      </div>
    );
  }

  const selectedDoc = localResult.categories.flatMap(c => c.items).find(i => i.id === selectedId);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header />
      
      <main className="flex-1 p-4 space-y-4">
        <section>
          <CustomerInfoForm />
        </section>
        
        <section>
          <LoanTabs />
        </section>
        
        <section className="h-[600px] flex overflow-hidden border border-gray-300 bg-white rounded-sm">
          {/* 좌측: 서류 트리 (실시간 상태 반영) */}
          <VerificationRepository 
            categories={localResult.categories} 
            selectedId={selectedId} 
            onSelect={setSelectedId} 
          />
          
          {/* 중앙: 실시간 교차 검증 에디터 */}
          <OcrFieldEditor 
            fields={localResult.documentFields[selectedId] || []} 
            status={selectedDoc?.status || 'APPROVED'}
            isRisk={selectedDoc?.isRisk}
            onFieldChange={handleFieldChange}
          />
          
          {/* 우측: 원본 서류 이미지 뷰어 */}
          <DocumentImageViewer />
        </section>
      </main>
    </div>
  );
};
