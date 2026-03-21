import { useState } from 'react';
import { Folder, FileText, ChevronDown, ChevronRight, AlertTriangle, Info } from 'lucide-react';
import { DocCategory, DocumentStatus, DocItem } from '@/entities/verification/model/types';

interface Props {
  categories: DocCategory[];
  documents: Record<string, DocItem>; // (Why: 평면 구조에서 개별 문서 데이터를 참조하기 위함)
  selectedId: string;
  onSelect: (id: string) => void;
}

/**
 * @widget verification-repository
 * 서류 카테고리를 트리 구조로 표시하며 아코디언 기능을 제공합니다.
 * (Why: 대규모 서류 묶음을 카테고리별로 효율적으로 관리하기 위함)
 */
export const VerificationRepository = ({ categories, documents, selectedId, onSelect }: Props) => {
  const [expanded, setExpanded] = useState<string[]>(categories.map(c => c.id));

  const toggle = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  /** 상태별 스타일 및 아이콘 설정 (Priority: 정합성 오류 > 위험 > 승인) */
  const getStatusStyles = (status: DocumentStatus) => {
    switch (status) {
      case 'MISSING':
        return { text: 'text-gray-400 opacity-60', bg: '', icon: null, disabled: true };
      case 'REVIEW_NEEDED':
        return { text: 'text-red-600 font-bold', bg: 'bg-red-50', icon: <AlertTriangle className="w-3 h-3 text-red-600" />, disabled: false };
      case 'RISK':
        return { text: 'text-yellow-700 font-bold', bg: 'bg-yellow-50', icon: <Info className="w-3 h-3 text-yellow-600" />, disabled: false };
      default:
        return { text: 'text-gray-600', bg: '', icon: null, disabled: false };
    }
  };

  return (
    <div className="w-[260px] h-full border-r border-gray-300 flex flex-col bg-[#F8F9FA] shrink-0">
      <div className="h-[32px] bg-gray-200 border-b border-gray-300 flex items-center px-3 shrink-0">
        <span className="text-[10px] font-bold text-[#444] uppercase tracking-wider">Repository Tree</span>
      </div>
      <div className="flex-1 overflow-auto py-2">
        {categories.map(cat => {
          const isExpanded = expanded.includes(cat.id);
          
          // (Why: 하위 문서들의 ID를 순회하며 폴더의 대표 상태를 실시간 도출합니다.)
          const catItems = cat.itemIds.map(id => documents[id]).filter(Boolean);
          const hasError = catItems.some(i => i.status === 'REVIEW_NEEDED');
          const hasRisk = catItems.some(i => i.status === 'RISK');
          const folderColor = hasError ? 'text-red-600' : hasRisk ? 'text-yellow-600' : 'text-[#00529B]';

          return (
            <div key={cat.id} className="mb-0.5">
              <div 
                onClick={() => toggle(cat.id)}
                className="h-[28px] flex items-center px-2 hover:bg-white cursor-pointer select-none transition-colors group border-y border-transparent hover:border-gray-200"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 mr-1" /> : <ChevronRight className="w-3.5 h-3.5 mr-1" />}
                <Folder className={`w-3.5 h-3.5 mr-2 ${folderColor}`} />
                <span className="text-[10px] font-black text-[#333] uppercase truncate flex-1">{cat.name}</span>
                {hasError && <AlertTriangle className="w-3 h-3 text-red-600 mr-1 animate-pulse" />}
                {!hasError && hasRisk && <Info className="w-3 h-3 text-yellow-600 mr-1" />}
              </div>
              
              {isExpanded && (
                <div className="bg-white">
                  {cat.itemIds.map(id => {
                    const item = documents[id];
                    if (!item) return null;

                    const { text, bg, icon, disabled } = getStatusStyles(item.status);
                    const isSelected = selectedId === item.id;

                    return (
                      <div 
                        key={item.id}
                        onClick={() => !disabled && onSelect(item.id)}
                        className={`
                          h-[26px] flex items-center px-8 cursor-pointer border-b border-[#F0F0F0] transition-all
                          ${disabled ? 'cursor-not-allowed pointer-events-none' : 'hover:bg-[#E9EEF3]'}
                          ${isSelected ? 'bg-[#004b93] !text-white' : `${text} ${bg}`}
                        `}
                      >
                        <FileText className={`w-3 h-3 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                        <span className="text-[9px] font-medium uppercase truncate flex-1">
                          {item.fileName} {item.status === 'MISSING' && '(누락)'}
                        </span>
                        {!isSelected && icon}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
