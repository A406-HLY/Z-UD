import json
import logging
from pathlib import Path
from confluent_kafka import Consumer, Producer, KafkaException, KafkaError
from batch_pipeline import BatchOCRPipeline

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("OCR-Worker")

# 경로 설정
APP_DIR = Path(__file__).resolve().parent
WORK_DIR = APP_DIR / "work"

# Kafka 설정
KAFKA_BOOTSTRAP_SERVERS = "j14a406.p.ssafy.io:80"
INPUT_TOPIC = "ocr-request"
OUTPUT_TOPIC = "ocr-response"
GROUP_ID = "ocr-service-group"

def main():
    logger.info("Initializing OCR Pipeline...")
    pipeline = BatchOCRPipeline(
        work_root=str(WORK_DIR),
        extractor_model_name="Qwen/Qwen2.5-VL-7B-Instruct",
        max_new_tokens=1200,
        render_dpi=180,
        default_bucket="loan-docs",
        debug=True,
    )

    consumer_conf = {
        'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS,
        'group.id': GROUP_ID,
        'auto.offset.reset': 'earliest'
    }
    consumer = Consumer(consumer_conf)
    consumer.subscribe([INPUT_TOPIC])

    producer_conf = {'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS}
    producer = Producer(producer_conf)

    def delivery_report(err, msg):
        if err is not None:
            logger.error(f"Message delivery failed: {err}")
        else:
            logger.info(f"Message delivered to {msg.topic()} [{msg.partition()}]")

    logger.info(f"Listening for requests on topic: {INPUT_TOPIC}...")

    try:
        while True:
            # 메시지 폴링 (1초 대기)
            msg = consumer.poll(timeout=1.0)
            if msg is None: continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF: continue
                else: raise KafkaException(msg.error())

            try:
                request_data = json.loads(msg.value().decode('utf-8'))
                logger.info(f"Received request: {request_data.get('consultationId')}")

                result = pipeline.process_consultation_job(request_data)

                response_payload = json.dumps(result, ensure_ascii=False).encode('utf-8')
                producer.produce(
                    OUTPUT_TOPIC, 
                    value=response_payload, 
                    callback=delivery_report
                )
                
                producer.flush()

            except Exception as e:
                logger.error(f"Error processing message: {e}")

    except KeyboardInterrupt:
        logger.info("Stopping worker...")
    finally:
        consumer.close()

if __name__ == "__main__":
    main()