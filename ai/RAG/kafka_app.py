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
                
            # [기능 추가] Update 요청인 경우 파이프라인(다운로드, 청킹 및 DB 저장) 실행
            if UPDATE_TOPIC and message.topic() == UPDATE_TOPIC:
                print(f"\n[UPDATE CALLED] Received Document Update from {UPDATE_TOPIC}")
                if isinstance(payload, list):
                    from api import update_single_document, update_vector_db
                    import urllib.request
                    import re
                    
                    doc_dir = os.path.join(current_dir, 'data', 'document')
                    os.makedirs(doc_dir, exist_ok=True)
                    
                    for doc_info in payload:
                        file_name_ko = doc_info.get("파일명", "")
                        download_url = doc_info.get("파일 경로", "")
                        
                        if not file_name_ko or not download_url:
                            print("[UPDATE WARNING] Missing '파일명' or '파일 경로'. Skipping.")
                            continue
                            
                        # Extract table name and extension (e.g. 싸딤돌_ssadimdol(260327).txt -> ssadimdol)
                        file_ext = os.path.splitext(file_name_ko)[1].lower()
                        if file_ext not in ['.txt', '.docx', '.doc']:
                            print(f"[UPDATE WARNING] Unsupported file type: {file_ext}. Skipping.")
                            continue
                            
                        match = re.search(r'_([a-zA-Z0-9]+)', file_name_ko)
                        doc_name = match.group(1) if match else file_name_ko.replace(file_ext, '')
                        
                        save_path = os.path.join(doc_dir, f"{doc_name}{file_ext}")
                        print(f"[*] Downloading: {file_name_ko} -> Table: {doc_name}")
                        
                        try:
                            req = urllib.request.Request(download_url, headers={'User-Agent': 'Mozilla/5.0'})
                            with urllib.request.urlopen(req) as response:
                                file_data = response.read()
                                
                            with open(save_path, 'wb') as f:
                                f.write(file_data)
                                
                            print(f"[SUCCESS] Saved file to {save_path}")
                            num_chunks = update_single_document(doc_name)
                            print(f"[UPDATE SUCCESS] Table '{doc_name}' updated with {num_chunks} chunks.")
                        except Exception as e:
                            print(f"[UPDATE ERROR] Failed to process {file_name_ko}: {e}")
                else:
                    # Fallback
                    print("[UPDATE WARNING] Payload is not a list. Attempting global DB update fallback.")
                    from api import update_vector_db
                    try:
                        update_vector_db()
                        print("[UPDATE SUCCESS] Global Vector DB update completed.")
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
