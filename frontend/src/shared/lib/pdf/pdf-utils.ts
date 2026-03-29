import * as pdfjsLib from 'pdfjs-dist';

/**
 * PDF 목차(Outline)로부터 { [조항명]: { pageNumber, yRatio } } 형태의 맵을 추출합니다.
 */
export const extractOutlineMap = async (pdf: pdfjsLib.PDFDocumentProxy) => {
  const outline = await pdf.getOutline();
  
  // (Note: 사용자 요청에 따라 북마크 유무 확인용 로그 출력)
  console.log('[PDF_DEBUG] Raw Outline Data:', outline);
  
  if (!outline || outline.length === 0) {
    console.warn('[PDF_DEBUG] No bookmarks found in this document.');
    return {};
  }

  const map: Record<string, { pageNumber: number; yRatio: number }> = {};

  const processItems = async (items: any[]) => {
    for (const item of items) {
      if (item.dest) {
        const result = await resolveDestination(pdf, item.dest);
        if (result) {
          map[item.title] = result;
        }
      }
      if (item.items && item.items.length > 0) {
        await processItems(item.items);
      }
    }
  };

  await processItems(outline);
  
  // (Point: 최종 가공된 맵을 출력하여 개발자가 "조항명 -> 페이지" 매핑을 쉽게 검토할 수 있도록 합니다.)
  console.log('[PDF_DEBUG] Final Processed Outline Map:', map);
  
  return map;
};

/**
 * PDF 내부 참조(Destination)를 실제 페이지 번호와 상단 기준 Y축 비율로 변환합니다.
 */
const resolveDestination = async (pdf: pdfjsLib.PDFDocumentProxy, dest: any) => {
  let explicitDest = dest;
  
  // Named destination 처리 (문자열인 경우)
  if (typeof dest === 'string') {
    explicitDest = await pdf.getDestination(dest);
  }

  if (!Array.isArray(explicitDest)) return null;

  // explicitDest[0]은 페이지 참조(Ref) 객체입니다.
  const pageRef = explicitDest[0];
  const pageIndex = await pdf.getPageIndex(pageRef);
  const pageNumber = pageIndex + 1;

  // explicitDest[1].name은 스크롤 방식 (ex: 'XYZ', 'FitH' 등)
  const destType = explicitDest[1]?.name;
  let yCoord: number | null = null;
  
  // (Note: PDF 스크롤 방식에 따라 높이 정보의 위치가 다릅니다.)
  if (destType === 'XYZ') {
    yCoord = explicitDest[3]; // [ref, /XYZ, x, y, zoom]
  } else if (destType === 'FitH' || destType === 'FitBH') {
    yCoord = explicitDest[2]; // [ref, /FitH, y]
  }

  let yRatio = 0;
  if (typeof yCoord === 'number') {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    // PDF는 하단이 0이므로, 상단 기준 비율로 변환: (높이 - y) / 높이
    yRatio = Math.max(0, (viewport.height - yCoord) / viewport.height);
  }

  return { pageNumber, yRatio };
};
