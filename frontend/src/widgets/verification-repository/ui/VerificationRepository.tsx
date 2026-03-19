import { useState } from 'react';
import { Folder, FileText, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { DocCategory } from '@/entities/verification/model/types';

interface Props {
  categories: DocCategory[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/**
 * @widget verification-repository
 * 서류 카테고리를 트리 구조로 표시하며 아코디언 기능을 제공합니다.
 * (Why: 대규모 서류 묶음을 카테고리별로 효율적으로 관리하기 위함)
 */
export const VerificationRepository = ({ categories, selectedId, onSelect }: Props) => {
  // 펼쳐진 카테고리 ID 목록 관리 (기본값: 모두 펼침)
  const [expanded, setExpanded] = useState<string[]>(categories.map(c => c.id));

  const toggle = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  return (
    <div className="w-[260px] h-full border-r border-gray-300 flex flex-col bg-[#F8F9FA] shrink-0">
      <div className="h-[32px] bg-gray-200 border-b border-gray-300 flex items-center px-3 shrink-0">
        <span className="text-[10px] font-bold text-[#444] uppercase tracking-wider">Repository Tree</span>
      </div>
      <div className="flex-1 overflow-auto py-2">
        {categories.map(cat => {
          const isExpanded = expanded.includes(cat.id);
          const hasError = cat.items.some(i => i.status === 'ERROR');

          return (
            <div key={cat.id} className="mb-0.5">
              {/* Category Header */}
              <div 
                onClick={() => toggle(cat.id)}
                className="h-[28px] flex items-center px-2 hover:bg-white cursor-pointer select-none transition-colors group border-y border-transparent hover:border-gray-200"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 mr-1" /> : <ChevronRight className="w-3.5 h-3.5 mr-1" />}
                <Folder className="w-3.5 h-3.5 mr-2 text-[#00529B]" />
                <span className="text-[10px] font-black text-[#333] uppercase truncate flex-1">{cat.name}</span>
                {hasError && <AlertTriangle className="w-3 h-3 text-red-600 mr-1" />}
              </div>
              
              {/* Item List */}
              {isExpanded && (
                <div className="bg-white">
                  {cat.items.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => onSelect(item.id)}
                      className={`
                        h-[26px] flex items-center px-8 cursor-pointer border-b border-[#F0F0F0] hover:bg-[#E9EEF3] transition-colors
                        ${selectedId === item.id ? 'bg-[#004b93] text-white' : item.status === 'ERROR' ? 'text-red-600' : 'text-gray-600'}
                      `}
                    >
                      <FileText className={`w-3 h-3 mr-2 ${selectedId === item.id ? 'text-white' : 'text-gray-400'}`} />
                      <span className="text-[9px] font-medium uppercase truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
