import { useState, useEffect } from 'react';
import { Folder, FileText, ChevronDown, ChevronRight, AlertTriangle, Info } from 'lucide-react';
import { DocCategory, DocumentStatus, DocItem } from '@/entities/verification/model/types';
import { calculateCategoryStatus } from '@/entities/verification/model/verification.logic';
import { useRepositoryKeyboard } from '../model/use-repository-keyboard';

interface Props {
  categories: DocCategory[];
  documents: Record<string, DocItem>; 
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRequestNextDocument: () => void;
  onRequestPrevDocument: () => void;
};

const LAYOUT = {
  SIDEBAR_WIDTH: '260px',
  HEADER_HEIGHT: '40px',
  CATEGORY_HEIGHT: '28px',
  ITEM_HEIGHT: '26px'
};


/**
 * @widget verification-repository
 * 서류 카테고리를 트리 구조로 표시하며 아코디언 기능을 제공합니다.
 * (Why: 대규모 서류 묶음을 카테고리별로 효율적으로 관리하기 위함)
 */
export const VerificationRepository = ({ categories, documents, selectedId, onSelect, onRequestNextDocument, onRequestPrevDocument }: Props) => {
  const [expanded, setExpanded] = useState<string[]>(categories.map(c => c.id));

  const toggle = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  // (Why: 탭 이동 등으로 선택된 서류가 닫혀있는 폴더 안에 있을 경우, 해당 폴더를 자동으로 엽니다.)
  useEffect(() => {
    if (selectedId) {
      const parentCat = categories.find(c => c.itemIds.includes(selectedId));
      if (parentCat && !expanded.includes(parentCat.id)) {
        setExpanded(prev => [...prev, parentCat.id]);
      }
    }
  }, [selectedId, categories, expanded]);

  /** 상태별 스타일 및 아이콘 구분 (Point 5: JSX 마크업을 분리하여 데이터만 반환하도록 개선) */
  const getStatusMeta = (status: DocumentStatus) => {
    switch (status) {
      case 'MISSING':
        return { text: 'text-gray-400 opacity-60', bg: '', iconType: null, disabled: true };
      case 'REVIEW_NEEDED':
        return { text: 'text-red-600 font-bold', bg: 'bg-red-50', iconType: 'error', disabled: false };
      case 'RISK':
        return { text: 'text-yellow-700 font-bold', bg: 'bg-yellow-50', iconType: 'risk', disabled: false };
      default:
        return { text: 'text-gray-600', bg: '', iconType: null, disabled: false };
    }
  };

  const renderStatusIcon = (type: string | null, isSelected: boolean) => {
    if (type === 'error') return <AlertTriangle className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-red-600'}`} />;
    if (type === 'risk') return <Info className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-yellow-600'}`} />;
    return null;
  };

  const { handleItemKeyDown } = useRepositoryKeyboard({
    onRequestNextDocument,
    onRequestPrevDocument
  });

  return (
    <div 
      className="h-full min-h-0 border-r border-gray-300 flex flex-col bg-[#F8F9FA] shrink-0"
      style={{ width: LAYOUT.SIDEBAR_WIDTH }}
    >
      <div 
        className="bg-gray-200 border-b border-gray-300 flex items-center px-3 shrink-0"
        style={{ height: LAYOUT.HEADER_HEIGHT }}
      >
        <span className="text-[11px] font-bold text-[#444] uppercase tracking-wider">Repository Tree</span>
      </div>
      <div className="flex-1 overflow-auto py-2">
        {categories.map(cat => {
          const isExpanded = expanded.includes(cat.id);
          const { hasError, hasRisk, folderColor } = calculateCategoryStatus(cat.itemIds, documents);

          return (
            <div key={cat.id} className="mb-0.5">
              <button 
                type="button"
                onClick={() => toggle(cat.id)}
                className="w-full text-left flex items-center px-2 hover:bg-white cursor-pointer select-none transition-colors group border-y border-transparent hover:border-gray-200"
                style={{ height: LAYOUT.CATEGORY_HEIGHT }}
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 mr-1" /> : <ChevronRight className="w-3.5 h-3.5 mr-1" />}
                <Folder className={`w-3.5 h-3.5 mr-2 ${folderColor}`} />
                <span className="text-[11px] font-black text-[#333] uppercase truncate flex-1">{cat.name}</span>
                {hasError && <AlertTriangle className="w-3 h-3 text-red-600 mr-1 animate-pulse" />}
                {!hasError && hasRisk && <Info className="w-3 h-3 text-yellow-600 mr-1" />}
              </button>
              
              {isExpanded && (
                <div className="bg-white">
                  {cat.itemIds.map(id => {
                    const item = documents[id];
                    if (!item) {
                      console.warn(`[VerificationRepository] Document missing for id: ${id}`);
                      return null;
                    }

                    const { text, bg, iconType, disabled } = getStatusMeta(item.status);
                    const isSelected = selectedId === item.id;

                    return (
                      <button 
                        type="button"
                        key={item.id}
                        data-doc-id={item.id}
                        disabled={disabled}
                        onClick={() => onSelect(item.id)}
                        onKeyDown={(e) => handleItemKeyDown(e, item)}
                        className={`
                          w-full text-left flex items-center px-8 border-b border-[#F0F0F0] transition-all
                          ${disabled ? 'cursor-not-allowed opacity-60' : isSelected ? 'bg-[#004b93] text-white' : `cursor-pointer hover:bg-[#E9EEF3] ${text} ${bg}`}
                        `}
                        style={{ height: LAYOUT.ITEM_HEIGHT }}
                      >
                        <FileText className={`w-3 h-3 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                        <span className="text-[10px] font-medium truncate flex-1 leading-none">
                          {item.fileName} {item.status === 'MISSING' && '(누락)'}
                        </span>
                        {renderStatusIcon(iconType, isSelected)}
                      </button>
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
