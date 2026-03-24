interface Props {
  bboxes: { key: string; points: string }[];
  focusedFieldKey: string | null;
}

/**
 * @widget document-image-viewer
 * PDF 캔버스 위에 OCR 추출 영역의 폴리곤 버퍼를 렌더링하는 순수 UI 레이어입니다.
 * (Why: DOM Element 과부하를 막기 위해 하나의 SVG 내부에서 수학적 좌표로 다각형을 렌더링합니다.)
 */
export const BboxOverlay = ({ bboxes, focusedFieldKey }: Props) => {
  return (
    <svg 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" 
      style={{ mixBlendMode: 'multiply' }}
    >
      {bboxes.map((bbox) => {
         const isFocused = bbox.key === focusedFieldKey;
         
         return (
           <polygon
             key={bbox.key}
             points={bbox.points}
             className={`transition-all duration-300 ${
               isFocused 
                ? 'fill-blue-500/20 stroke-[#004b93] stroke-[1.5px] drop-shadow-[0_0_12px_rgba(0,75,147,0.8)]' 
                : 'fill-blue-500/10 stroke-blue-400/70 stroke-1'
             }`}
           />
         );
      })}
    </svg>
  );
};
