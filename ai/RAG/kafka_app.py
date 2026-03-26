import os
import json
import traceback
from dotenv import load_dotenv
from confluent_kafka import Consumer, Producer, KafkaError

# 환경 변수 로드
current_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(current_dir, ".env")
load_dotenv(dotenv_path)

KAFKA_BROKER = os.environ.get("KAFKA_BROKER_URL")
INPUT_TOPIC = os.environ.get("KAFKA_INPUT_TOPIC")
OUTPUT_TOPIC = os.environ.get("KAFKA_OUTPUT_TOPIC")  # 유저 요청에 따라 review-request 또는 review-rquest
GROUP_ID = os.environ.get("KAFKA_GROUP_ID")

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
    producer_conf = {
        'bootstrap.servers': KAFKA_BROKER
    }
    producer = Producer(producer_conf)
    
    # 3. Kafka Consumer 초기화
    print("[Init] Connecting Kafka Consumer...")
    consumer_conf = {
        'bootstrap.servers': KAFKA_BROKER,
        'group.id': GROUP_ID,
        'auto.offset.reset': 'latest'
    }
    consumer = Consumer(consumer_conf)
    consumer.subscribe([INPUT_TOPIC])
    
    print("\n=======================================================")
    print(f"[*] Ready to Process Messages from [{INPUT_TOPIC}]")
    print("=======================================================\n")
    
    def delivery_report(err, msg):
        if err is not None:
            print(f"[ERROR] Message delivery failed: {err}")
    
    # 4. 이벤트 루프
    try:
        while True:
            message = consumer.poll(timeout=1.0)
            
            if message is None:
                continue
            if message.error():
                if message.error().code() == KafkaError._PARTITION_EOF:
                    continue
                else:
                    print(f"[ERROR] Consumer error: {message.error()}")
                    continue

            val_bytes = message.value()
            if not val_bytes:
                continue
                
            try:
                payload = json.loads(val_bytes.decode('utf-8'))
            except json.JSONDecodeError:
                print("[ERROR] Failed to decode JSON payload")
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
            val_bytes = json.dumps(result_dict, ensure_ascii=False).encode('utf-8')
            producer.produce(OUTPUT_TOPIC, value=val_bytes, callback=delivery_report)
            producer.poll(0)
            producer.flush()
            
            print(f"[SUCCESS] Evaluated and pushed response to {OUTPUT_TOPIC} | ID: {req_id}")
            
        except Exception as e:
            # HTTPException 등 에러 디테일 출력
            error_detail = getattr(e, "detail", str(e))
            print(f"[ERROR] Failed to process message ID: {req_id}")
            print(f"[ERROR] Reason: {error_detail}")
            traceback.print_exc()

    except KeyboardInterrupt:
        print("\n[*] Service stopped by user")
    finally:
        consumer.close()
        producer.flush()

if __name__ == "__main__":
    main()
