import { useState } from 'react';
import { Button } from '@/shared/ui';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Document {
  id: string;
  no: number;
  fileName: string;
  size: string;
  status: 'VERIFIED' | 'PENDING' | 'PROCESSING';
}

// ... (중략: Document 인터페이스 정의 유지)

const EMPTY_DOCS: Document[] = [];

/**
 * 중앙 분할형 서류 뷰어 위젯
 * - BATCH SEGMENT A/B 두 영역으로 분리
 * - 체크박스 선택 기능 포함
 * - 우측 상단 '다음 단계' 버튼 추가
 */
export const DocumentViewer = () => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const renderTable = (title: string, docs: Document[]) => (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-700">{title} [COUNT: {docs.length}]</h3>
      </div>
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 text-[11px] uppercase text-gray-400 font-bold border-b border-gray-200">
          <tr>
            <th className="px-3 py-2 w-10 text-center">
              <input type="checkbox" className="rounded-sm border-gray-300" />
            </th>
            <th className="px-3 py-2 w-12">NO.</th>
            <th className="px-3 py-2">FILE NAME</th>
            <th className="px-3 py-2 w-24">SIZE</th>
            <th className="px-3 py-2 w-24">STATUS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 italic">
          {docs.map((doc) => (
            <tr key={doc.id} className="hover:bg-blue-50/50 transition-colors text-xs">
              <td className="px-3 py-2 text-center">
                <input 
                  type="checkbox" 
                  checked={selectedIds.has(doc.id)}
                  onChange={() => toggleSelect(doc.id)}
                  className="rounded-sm border-gray-300 text-[#004b93]" 
                />
              </td>
              <td className="px-3 py-2 text-gray-500">{doc.no}</td>
              <td className="px-3 py-2 font-medium text-blue-600 underline cursor-pointer truncate">
                {doc.fileName}
              </td>
              <td className="px-3 py-2 text-gray-500">{doc.size}</td>
              <td className="px-3 py-2">
                <StatusBadge status={doc.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
      <div className="px-4 py-2 border-b border-gray-200 bg-white flex justify-end items-center">
        <Button 
          size="sm" 
          className="bg-[#004b93] text-white text-xs px-6"
          onClick={() => alert('다음 단계로 진행합니다.')}
        >
          다음 단계
        </Button>
      </div>
      <div className="flex h-[500px]">
        {renderTable('BATCH SEGMENT A', EMPTY_DOCS)}
        <div className="w-px bg-gray-200" />
        {renderTable('BATCH SEGMENT B', EMPTY_DOCS)}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: Document['status'] }) => {
  const styles = {
    VERIFIED: 'text-green-600 flex items-center gap-1',
    PENDING: 'text-orange-500 flex items-center gap-1',
    PROCESSING: 'text-blue-500 flex items-center gap-1',
  };

  const labels = {
    VERIFIED: 'VERIFIED',
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
  };

  const icons = {
    VERIFIED: '✓',
    PENDING: '◎',
    PROCESSING: '◎',
  };

  return (
    <span className={cn('text-[10px] font-bold', styles[status])}>
      <span>{icons[status]}</span>
      {labels[status]}
    </span>
  );
};
