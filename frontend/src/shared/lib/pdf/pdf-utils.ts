import * as pdfjsLib from 'pdfjs-dist';

export const extractOutlineMap = async (pdf: pdfjsLib.PDFDocumentProxy) => {
  const outline = await pdf.getOutline();

  if (!outline || outline.length === 0) {

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

  return map;
};

const resolveDestination = async (pdf: pdfjsLib.PDFDocumentProxy, dest: any) => {
  let explicitDest = dest;

  if (typeof dest === 'string') {
    explicitDest = await pdf.getDestination(dest);
  }

  if (!Array.isArray(explicitDest)) return null;

  const pageRef = explicitDest[0];
  const pageIndex = await pdf.getPageIndex(pageRef);
  const pageNumber = pageIndex + 1;

  const destType = explicitDest[1]?.name;
  let yCoord: number | null = null;

  if (destType === 'XYZ') {
    yCoord = explicitDest[3];
  } else if (destType === 'FitH' || destType === 'FitBH') {
    yCoord = explicitDest[2];
  }

  let yRatio = 0;
  if (typeof yCoord === 'number') {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    yRatio = Math.max(0, (viewport.height - yCoord) / viewport.height);
  }

  return { pageNumber, yRatio };
};