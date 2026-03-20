import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/widgets/header';
import { LoanTabs } from '@/widgets/loan-tabs';
import { CustomerInfoForm } from '@/widgets/customer-info-form';
import { VerificationRepository } from '@/widgets/verification-repository/ui/VerificationRepository';
import { OcrFieldEditor } from '@/widgets/ocr-field-editor/ui/OcrFieldEditor';
import { DocumentImageViewer } from '@/widgets/document-image-viewer/ui/DocumentImageViewer';
import { useVerificationQuery } from '@/features/verification/api/use-verification-query';
import { mapServerResponseToVerificationResult } from '@/entities/verification/model/verification.mapper';
import { VerificationResult } from '@/entities/verification/model/types';

/**
 * @page verification-result
 * 서류 검증 결과 및 OCR 교정을 수행하는 업무 페이지입니다.
 * (Why: 전처리된 데이터를 기반으로 실시간 교차 검증 상태를 중앙 관리)
 */
export const VerificationResultPage = () => {
  const [selectedId, setSelectedId] = useState('item-1');
  const [localResult, setLocalResult] = useState<VerificationResult | null>(null);
  
  const { data: serverResponse, isLoading } = useVerificationQuery('v-12345');

  /** 
   * 데이터 전처리 (Two-pass 전략) 
   * (Why: 서버 응답이 오면 즉시 인덱싱된 UI 상태 객체로 변환하여 로컬 상태 초기화)
   */
  useEffect(() => {
    if (serverResponse) {
      const initialResult = mapServerResponseToVerificationResult(serverResponse, 'v-12345');
      setLocalResult(initialResult);
      setSelectedId(initialResult.selectedDocId);
    }
  }, [serverResponse]);

  /** 
   * 실시간 교차 검증 핸들러 (Real-time onChange) 
   * (Why: 사용자가 입력할 때마다 O(1) 속도로 타 문서와 정합성 체크)
   */
  const handleFieldChange = (key: string, value: string) => {
    if (!localResult) return;

    setLocalResult(prev => {
      if (!prev) return null;

      // 1. 현재 필드 데이터 업데이트
      const updatedFields = { ...prev.documentFields };
      const currentDocFields = [...(updatedFields[selectedId] || [])];
      
      const fieldIndex = currentDocFields.findIndex(f => f.key === key);
      if (fieldIndex > -1) {
        // 교차 검증 딕셔너리 참조 (O(1))
        const isMatch = prev.crossValidationDict[key]?.has(value) ?? true;
        
        currentDocFields[fieldIndex] = {
          ...currentDocFields[fieldIndex],
          value,
          isMatch,
          isModified: true
        };
      }
      updatedFields[selectedId] = currentDocFields;

      // 2. 문서 및 카테고리 상태 재평가 (필드 수정에 따른 실시간 UI 업데이트)
      const updatedCategories = prev.categories.map(cat => ({
        ...cat,
        items: cat.items.map(item => {
          if (item.id === selectedId) {
            // 하나라도 불일치 필드가 있으면 REVIEW_NEEDED 상태 유지
            const hasMismatch = currentDocFields.some(f => !f.isMatch);
            return {
              ...item,
              status: hasMismatch ? 'REVIEW_NEEDED' : item.isRisk ? 'RISK' : 'APPROVED'
            };
          }
          return item;
        })
      }));

      return {
        ...prev,
        documentFields: updatedFields,
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
