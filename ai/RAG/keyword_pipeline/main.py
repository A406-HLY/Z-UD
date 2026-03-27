import json
import os
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(current_dir))
from keyword_pipeline.pipeline import KeywordExtractionPipeline

def main():
    print('\n' + '=' * 60)
    print(' [고품질 키워드 추출 파이프라인 v2 실행] '.center(60, '='))
    print('=' * 60)
    
    parent_dir = os.path.dirname(current_dir)
    data_dir = os.path.join(parent_dir, 'data')
    document_dir = os.path.join(data_dir, 'document')
    chunk_dump_dir = os.path.join(data_dir, 'chunks')
    
    if not os.path.exists(chunk_dump_dir):
        os.makedirs(chunk_dump_dir, exist_ok=True)
        
    total_processed = 0
    total_chunks = 0
    
    for filename in os.listdir(document_dir):
        if not filename.endswith('.txt'):
            continue
            
        doc_name = filename.replace('.txt', '')
        file_path = os.path.join(document_dir, filename)
        
        print(f"\n[Process] '{doc_name}' 문서 청킹 파이프라인 시작...")
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        pipeline = KeywordExtractionPipeline(content=content)
        try:
            results = pipeline.run()
        except Exception as e:
            print(f'\n[Error] {doc_name} 파이프라인 실행 중 오류 발생: {e}')
            import traceback
            traceback.print_exc()
            continue
            
        output_path = os.path.join(chunk_dump_dir, f"{doc_name}_chunks.json")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
            
        print(f"[{doc_name}] 📌 총 {len(results)}개 단위 청킹 완료")
        
        if len(results) > 0:
            res = results[0]
            print(f"   🔹 예시 [{res['article_id']}] 최종 키워드: {', '.join(res['final_keywords'][:3])}...")
            
        print(f"   📁 결과 저장: {output_path}")
        total_processed += 1
        total_chunks += len(results)
        
    print('\n' + '-' * 60)
    print(f'🚀 파이프라인 전체 완료: 총 {total_processed}개 문서, {total_chunks}개 청크 처리됨.')
    print('=' * 60 + '\n')

if __name__ == '__main__':
    main()
