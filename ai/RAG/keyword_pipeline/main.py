import json
import os
import sys

# 프로젝트 루트를 경로에 추가 (패키지 로딩 보장)
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(current_dir))

from keyword_pipeline.pipeline import KeywordExtractionPipeline

def main():
    """
    고품질 키워드 추출 파이프라인 v2 실행
    """
    print("\n" + "="*60)
    print(" [고품질 키워드 추출 파이프라인 v2 실행] ".center(60, "="))
    print("="*60)
    
    pipeline = KeywordExtractionPipeline()
    try:
        results = pipeline.run()
    except Exception as e:
        print(f"\n[Error] 파이프라인 실행 중 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        return

    # 결과 요약 출력
    for res in results[:5]: # 전반부 5개 출력
        print(f"\n📌 [{res['article_id']}] {res['title']}")
        print(f"   🔹 최종 키워드: {', '.join(res['final_keywords'])}")
        # 점수 상세 (상위 3개만)
        score_info = [f"{d['word']}({d['final_score']})" for d in res['details'][:3]]
        print(f"   🔸 상세 가중치: {', '.join(score_info)}")
        
    print("\n" + "-"*60)
    
    # JSON 파일로 결과 저장
    output_path = os.path.join(current_dir, "extraction_results.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"🚀 전체 {len(results)}개 아티클 처리 완료.")
    print(f"📂 결과 저장 위치: {output_path}")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
