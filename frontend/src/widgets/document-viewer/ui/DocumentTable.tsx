import { Document } from '@/entities/loan-document/model/types';
import { StatusBadge } from '@/entities/loan-document/ui/StatusBadge';
import { DOCUMENT_TABLE_HEADERS } from '@/entities/loan-document/model/document.constants';

interface DocumentTableProps {
  docs: Document[];
  isLeftColumn: boolean;
  selectedIds: Set<string>;
  totalDocsLength: number;
  toggleAll: (checked: boolean) => void;
  toggleSelect: (id: string) => void;
}

export const DocumentTable = ({
  docs,
  isLeftColumn,
  selectedIds,
  totalDocsLength,
  toggleAll,
  toggleSelect
}: DocumentTableProps) => {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#fafafa] overflow-y-auto w-1/2">
      <table className="w-full text-left border-collapse table-fixed">
        <thead className="bg-[#f0f4f8] text-[10px] uppercase text-gray-500 font-bold border-b border-gray-200 sticky top-0 z-10">
          <tr>
            <th className="px-2 py-1.5 w-8 text-center">
              {isLeftColumn && (
                <input
                  type="checkbox"
                  className="rounded-none border-gray-300 w-3 h-3 text-[#004b93] cursor-pointer"
                  checked={totalDocsLength > 0 && selectedIds.size === totalDocsLength}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              )}
            </th>
            <th className="px-2 py-1.5 w-10 text-center">{DOCUMENT_TABLE_HEADERS.NO}</th>
            <th className="px-2 py-1.5">{DOCUMENT_TABLE_HEADERS.FILE_NAME}</th>
            <th className="px-2 py-1.5 w-24 text-center">{DOCUMENT_TABLE_HEADERS.STATUS}</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {docs.map((doc) => (
            <tr key={doc.id} className="hover:bg-blue-50/50 transition-colors text-[11px] group">
              <td className="px-2 py-1.5 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.has(doc.id)}
                  onChange={() => toggleSelect(doc.id)}
                  className="rounded-none border-gray-300 text-[#004b93] w-3 h-3 cursor-pointer"
                />
              </td>
              <td className="px-2 py-1.5 text-gray-400 font-mono text-center">{doc.no}</td>
              <td className="px-2 py-1.5 font-medium text-slate-700 truncate group-hover:text-blue-600 cursor-pointer">
                {doc.fileName}
              </td>
              <td className="px-2 py-1.5 flex justify-center">
                <StatusBadge status={doc.status} />
              </td>
            </tr>
          ))}
          {docs.length > 0 && (
            <tr className="h-full">
              <td colSpan={4}></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};