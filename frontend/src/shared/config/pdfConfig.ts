/**
 * @shared config
 * PDF 파일 및 내규 조항 매핑 설정
 */

export const ARTICLE_PAGE_MAP: Record<string, number> = {
  "제1조": 1,
  "제2조": 2,
  "제3조": 3,
  "제4조": 4,
  "제5조": 4,
  "제6조": 5,
  "제7조": 5,
  "제8조": 6,
  "제9조": 6,
  "제10조": 7,
  "제11조": 7,
  "제12조": 8,
  "제13조": 8,
  "내규-신용-01": 4,
};

export const MOCK_PDF_FILES = [
  { fileId: "p1", pageNum: 1 },
  { fileId: "p2", pageNum: 2 },
  { fileId: "p3", pageNum: 3 },
  { fileId: "p4", pageNum: 4 },
  { fileId: "p5", pageNum: 5 },
  { fileId: "p6", pageNum: 6 },
  { fileId: "p7", pageNum: 7 },
  { fileId: "p8", pageNum: 8 },
];
