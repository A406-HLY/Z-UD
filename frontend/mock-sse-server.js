import http from 'node:http';

/**
 * @mock SSE & API Server 
 * (Why) 백엔드 SSE 미구현 및 주택 시세 조회 API(500) 우회를 위한 통합 Mock 서버입니다.
 * (P2) 사용자가 진행 상황을 충분히 관찰할 수 있도록 이벤트 간격을 3~4초로 조정했습니다.
 */
const server = http.createServer((req, res) => {
  console.log(`[Mock Server] Received ${req.method} ${req.url}`);
  
  // CORS 처리
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. 주택 시세 조회 API Mock
  if (req.method === 'POST' && req.url.includes('/audits/house')) {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: true,
      data: {
        illegalBuilding: false,
        supportedHouseType: true,
        housePrice: { price: 92000, priceType: 'KB 시세', message: '정상 조회됨' },
        nearestBranch: { currentBranchIsNearest: true, currentBranchName: '원주지점', message: '관할 내' }
      }
    }));
    return;
  }

  // 2. SSE 구독 Mock
  if (req.method === 'GET' && req.url.includes('/notification/subscribe')) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    res.write('retry: 5000\n');
    res.write(': initial keep-alive\n\n');

    const sendEvent = (type, message, data = {}) => {
      res.write(`event: ${type}\n`);
      res.write(`data: ${JSON.stringify({ eventType: type, message, data })}\n\n`);
    };

    // --- 시나리오 (지연 시간 증가) ---
    sendEvent('connect', 'SSE 연결 성공');

    setTimeout(() => sendEvent('OCR_COMPLETED', 'OCR 분석 완료'), 3000);
    
    setTimeout(() => {
      sendEvent('HOUSE_AUDIT_STARTED', '주택 심사 시작', { propertyAddress: '원주시 일산동 신진빌리지' });
      sendEvent('HOUSE_AUDIT_ILLEGAL_BUILDING_CHECK_STARTED', '위반 건축물 확인 중...');
    }, 7000);

    setTimeout(() => {
      sendEvent('HOUSE_AUDIT_ILLEGAL_BUILDING_CHECK_COMPLETED', '위반 건축물 검사 완료', { illegalBuilding: false });
      sendEvent('HOUSE_AUDIT_NEAREST_BRANCH_CHECK_STARTED', '관할 지점 계산 중...');
    }, 11000);

    setTimeout(() => {
      sendEvent('HOUSE_AUDIT_NEAREST_BRANCH_CHECK_COMPLETED', '지점 매칭 완료', { currentBranchIsNearest: true });
      sendEvent('HOUSE_AUDIT_PRICE_CHECK_STARTED', 'KB 시세 조회 중...');
    }, 15000);

    setTimeout(() => {
      sendEvent('HOUSE_AUDIT_PRICE_CHECK_COMPLETED', '주택 시세 조회 완료');
      sendEvent('MY_DATA_AUDIT_STARTED', '마이데이터 스크래핑 시작');
    }, 19000);

    setTimeout(() => {
      sendEvent('MY_DATA_CREDIT_RATING_LOOKUP_STARTED', '신용 등급 조회 중...');
    }, 23000);

    setTimeout(() => {
      sendEvent('MY_DATA_CREDIT_RATING_LOOKUP_COMPLETED', '신용 등급 조회 완료', { summary: 'A' });
      sendEvent('MY_DATA_LOAN_PRODUCTS_LOOKUP_STARTED', '기존 대출 현황 수집 중...');
    }, 27000);

    setTimeout(() => {
      sendEvent('MY_DATA_LOAN_PRODUCTS_LOOKUP_COMPLETED', '대출 내역 조회 완료', { summary: '확인 완료' });
      sendEvent('HOUSE_AUDIT_COMPLETED', '심사 적격 판정', { 
        success: true,
        data: {
          illegalBuilding: false,
          supportedHouseType: true,
          housePrice: { price: 92000, priceType: 'KB 시세' },
          nearestBranch: { currentBranchIsNearest: true }
        }
      });
    }, 31000);

    setTimeout(() => {
      sendEvent('REPORT_COMPLETED', '모든 심사 완료');
    }, 1000000000);

    const keepAlive = setInterval(() => res.write(': keep-alive\n\n'), 30000);
    req.on('close', () => clearInterval(keepAlive));
  }
});

server.listen(5000, () => console.log('[Mock Server] Multi-Mock running at :5000'));
