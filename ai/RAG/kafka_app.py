import os
import json
import traceback
from dotenv import load_dotenv
from kafka import KafkaConsumer, KafkaProducer

# 환경 변수 로드
current_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(current_dir, ".env")
load_dotenv(dotenv_path)

KAFKA_BROKER = os.getenv("KAFKA_BROKER_URL", "j14a406.p.ssafy.io:80")
INPUT_TOPIC = os.getenv("KAFKA_INPUT_TOPIC", "report-request")
OUTPUT_TOPIC = os.getenv("KAFKA_OUTPUT_TOPIC", "review-request")  # 유저 요청에 따라 review-request 또는 review-rquest
GROUP_ID = os.getenv("KAFKA_GROUP_ID", "rag_consumer_group")

# 기존 api.py에서 코어 로직 재사용
from api import AppState, startup_event, search_rules

def main():
    print(f"[*] Starting Kafka RAG Service...")
    print(f"[*] Broker: {KAFKA_BROKER}")
    print(f"[*] Input Topic: {INPUT_TOPIC}")
    print(f"[*] Output Topic: {OUTPUT_TOPIC}")
    
    # 1. 문서 청크 및 벡터 DB 인메모리 로드 (api.py의 startup_event 재사용)
    print("\n[Init] Loading Vector DB and AppState...")
    startup_event()
    
    # 2. Kafka Producer 초기화
    print("\n[Init] Connecting Kafka Producer...")
    producer = KafkaProducer(
        bootstrap_servers=[KAFKA_BROKER],
        value_serializer=lambda v: json.dumps(v, ensure_ascii=False).encode('utf-8'),
        api_version=(0, 10, 2)
    )
    
    # 3. Kafka Consumer 초기화
    print("[Init] Connecting Kafka Consumer...")
    consumer = KafkaConsumer(
        INPUT_TOPIC,
        bootstrap_servers=[KAFKA_BROKER],
        group_id=GROUP_ID,
        auto_offset_reset='latest',
        value_deserializer=lambda x: json.loads(x.decode('utf-8')) if x else {},
        api_version=(0, 10, 2)
    )
    
    print("\n=======================================================")
    print(f"[*] Ready to Process Messages from [{INPUT_TOPIC}]")
    print("=======================================================\n")
    
    # 4. 이벤트 루프
    for message in consumer:
        payload = message.value
        if not payload:
            continue
            
        req_id = payload.get("consultationId", payload.get("counselId", payload.get("UUID", "N/A")))
        print(f"\n[RECEIVED] Message from {INPUT_TOPIC} | ID: {req_id}")
        
        try:
            # api.py의 search_rules 로직 그대로 실행 (RAG 검색 수행 및 JSON 조합)
            response_obj = search_rules(payload)
            
            # Pydantic 모델을 딕셔너리로 덤프
            # model_dump() is available in v2, dict() in v1. 
            if hasattr(response_obj, "model_dump"):
                result_dict = response_obj.model_dump()
            else:
                result_dict = response_obj.dict()
            
            # 처리 결과 생산
            producer.send(OUTPUT_TOPIC, value=result_dict)
            producer.flush()
            
            print(f"[SUCCESS] Evaluated and pushed response to {OUTPUT_TOPIC} | ID: {req_id}")
            
        except Exception as e:
            # HTTPException 등 에러 디테일 출력
            error_detail = getattr(e, "detail", str(e))
            print(f"[ERROR] Failed to process message ID: {req_id}")
            print(f"[ERROR] Reason: {error_detail}")
            traceback.print_exc()

if __name__ == "__main__":
    main()
