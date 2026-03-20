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

      // (Why: OCR 서류마다 '이름'을 뜻하는 필드명이 다르므로, 이를 하나의 '고객 성명' 그룹으로 묶어 원장 데이터와 대조합니다.)
      const nameGroup = ['name', 'buyer', 'ownerName', 'headOfHouseholdName', 'incomeRecipientName', 'representativeName'];
      const isNameField = nameGroup.includes(baseKey) || key.includes('name'); 
      const isIdField = baseKey === 'residentRegistrationNumber' || baseKey === 'identifierNumber';
      const isPhoneField = baseKey === 'phoneNumber';

      // 분기 A: 고객 정보(Redux)와 대조 (논리적 매핑 그룹 활용)
      if (isNameField || isIdField || isPhoneField) {
        const customerValue = 
          isNameField ? customerInfo.name : 
          isIdField ? customerInfo.personalId : 
          customerInfo.phoneNumber;
        
        isResolved = customerValue === value;
      } 
      // 분기 B: 서류 간 상호 대조 (고객 정보가 아닌 일반 데이터)
      else {
        const targetDocIds = prev.errorTargetDict[key] || new Set();
        const collectedValues = new Set<string>();
        
        targetDocIds.forEach(docId => {
           if (docId === selectedId) {
             collectedValues.add(value);
           } else {
             const field = newDocumentFields[docId]?.find(f => f.key === key);
             if (field && field.value !== null) collectedValues.add(String(field.value));
           }
        });

        isResolved = collectedValues.size === 1 && !collectedValues.has("");
      }

      // 단계 2: 연쇄 업데이트 (Cascading Update)
      // (Why: 논리적으로 같은 의미(예: 이름)를 가진 오류 필드들도 함께 연쇄 해제해야 하므로, errorTargetDict 외에도 그룹 기반 전수 조사가 필요할 수 있음.
      // 현재는 동일한 키(key)를 가진 타겟 문서에 대해서만 일괄 변경 수행)
      const targetDocIdsToUpdate = prev.errorTargetDict[key] || new Set([selectedId]);
      
      targetDocIdsToUpdate.forEach(docId => {
        if (newDocumentFields[docId]) {
          newDocumentFields[docId] = newDocumentFields[docId].map(f => {
            if (f.key === key) {
              return { 
                ...f, 
                value: docId === selectedId ? value : f.value, 
                isMatch: isResolved,                           
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
