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

const MOCK_DOCS_A: Document[] = [
  { id: '1', no: 1, fileName: '2026-03-16-12:44-1.pdf', size: '1,234 KB', status: 'VERIFIED' },
  { id: '2', no: 2, fileName: 'STOCK_STATEMENT_001.pdf', size: '2,542 KB', status: 'PENDING' },
  { id: '3', no: 3, fileName: 'ID_CARD_COPY_FRONT.jpg', size: '542 KB', status: 'VERIFIED' },
  { id: '4', no: 4, fileName: 'ID_CARD_COPY_BACK.jpg', size: '511 KB', status: 'VERIFIED' },
  { id: '5', no: 5, fileName: 'TAX_CERT_2025.pdf', size: '4,102 KB', status: 'PROCESSING' },
  { id: '6', no: 6, fileName: 'EMPLOYMENT_PROOF.pdf', size: '892 KB', status: 'VERIFIED' },
];

const MOCK_DOCS_B: Document[] = [
  { id: '7', no: 7, fileName: 'COLLATERAL_AGREEMENT.pdf', size: '1,234 KB', status: 'VERIFIED' },
  { id: '8', no: 8, fileName: 'BANK_BOOK_SCAN.png', size: '782 KB', status: 'PENDING' },
  { id: '9', no: 9, fileName: 'LOAN_APPLICATION_V1.pdf', size: '2,102 KB', status: 'VERIFIED' },
  { id: '10', no: 10, fileName: 'CREDIT_CONSENT_FORM.pdf', size: '342 KB', status: 'VERIFIED' },
  { id: '11', no: 11, fileName: 'HOUSEHOLD_CERT.pdf', size: '1,292 KB', status: 'PROCESSING' },
  { id: '12', no: 12, fileName: 'ANNUAL_INCOME_2025.pdf', size: '920 KB', status: 'VERIFIED' },
];

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
        {renderTable('BATCH SEGMENT A', MOCK_DOCS_A)}
        <div className="w-px bg-gray-200" />
        {renderTable('BATCH SEGMENT B', MOCK_DOCS_B)}
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
