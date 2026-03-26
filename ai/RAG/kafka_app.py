import os
import json
import traceback
from dotenv import load_dotenv
from confluent_kafka import Consumer, Producer, KafkaError
current_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(current_dir, '.env')
load_dotenv(dotenv_path)
KAFKA_BROKER = os.environ.get('KAFKA_BROKER_URL')
INPUT_TOPIC = os.environ.get("KAFKA_INPUT_TOPIC")
OUTPUT_TOPIC = os.environ.get("KAFKA_OUTPUT_TOPIC")  
UPDATE_TOPIC = os.environ.get("KAFKA_UPDATE_TOPIC")
GROUP_ID = os.environ.get("KAFKA_GROUP_ID")
from api import AppState, startup_event, search_rules, update_vector_db

def main():
    print(f"[*] Starting Kafka RAG Service...")
    print(f"[*] Broker: {KAFKA_BROKER}")
    print(f"[*] Input Topic: {INPUT_TOPIC}")
    print(f"[*] Output Topic: {OUTPUT_TOPIC}")
    print(f"[*] Update Topic: {UPDATE_TOPIC}")
    print("\n[Init] Loading Vector DB and AppState...")
    startup_event()
    print("\n[Init] Connecting Kafka Producer...")
    producer_conf = {
        'bootstrap.servers': KAFKA_BROKER
    }
    producer = Producer(producer_conf)
    print("[Init] Connecting Kafka Consumer...")
    consumer_conf = {
        'bootstrap.servers': KAFKA_BROKER,
        'group.id': GROUP_ID,
        'auto.offset.reset': 'latest'
    }
    consumer = Consumer(consumer_conf)
    
    topics_to_subscribe = [INPUT_TOPIC]
    if UPDATE_TOPIC:
        topics_to_subscribe.append(UPDATE_TOPIC)
    consumer.subscribe(topics_to_subscribe)
    
    print("\n=======================================================")
    print(f"[*] Ready to Process Messages from {topics_to_subscribe}")
    print("=======================================================\n")

    def delivery_report(err, msg):
        if err is not None:
            print(f"[ERROR] Message delivery failed: {err}")
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
                raw_data = json.loads(val_bytes.decode('utf-8'))
                payload = raw_data.get("payload", raw_data) if isinstance(raw_data.get("payload"), dict) else raw_data
            except json.JSONDecodeError:
                print("[ERROR] Failed to decode JSON payload")
                continue
                
            # [기능 추가] Update 요청인 경우 파이프라인(청킹 및 DB 저장) 재실행
            if UPDATE_TOPIC and message.topic() == UPDATE_TOPIC:
                print(f"\n[UPDATE CALLED] Received update request from {UPDATE_TOPIC}. Refreshing Vector DB...")
                try:
                    update_vector_db()
                    print("[UPDATE SUCCESS] Vector DB has been successfully updated with new files.")
                except Exception as e:
                    print(f"[UPDATE ERROR] Failed to update Vector DB: {e}")
                continue

            req_id = payload.get("consultationId", payload.get("counselId", payload.get("UUID", "N/A")))
            print(f"\n[RECEIVED] Message from {message.topic()} | ID: {req_id}")
            try:
                response_obj = search_rules(payload)
                if hasattr(response_obj, "model_dump"):
                    result_dict = response_obj.model_dump()
                else:
                    result_dict = response_obj.dict()
                val_bytes = json.dumps(result_dict, ensure_ascii=False).encode('utf-8')
                producer.produce(OUTPUT_TOPIC, value=val_bytes, callback=delivery_report)
                producer.poll(0)
                producer.flush()
                print(f"[SUCCESS] Evaluated and pushed response to {OUTPUT_TOPIC} | ID: {req_id}")
            except Exception as e:
                error_detail = getattr(e, 'detail', str(e))
                print(f'[ERROR] Failed to process message ID: {req_id}')
                print(f'[ERROR] Reason: {error_detail}')
                traceback.print_exc()
    except KeyboardInterrupt:
        print('\n[*] Service stopped by user')
    finally:
        consumer.close()
        producer.flush()
if __name__ == '__main__':
    main()
