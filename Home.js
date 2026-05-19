// 홈 화면 전용 스타일 정의
const homeStyles = `
    .home-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 30px; }
    .nav-card { background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 30px; cursor: pointer; transition: 0.2s; display: flex; flex-direction: column; }
    .nav-card:hover { transform: translateY(-5px); background-color: #334155; border-color: #38bdf8; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); }
    .nav-card h3 { color: #38bdf8; margin-bottom: 12px; font-size: 20px; }
    .nav-card p { color: #94a3b8; font-size: 14px; line-height: 1.5; flex-grow: 1; }
    .card-footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #334155; color: #475569; font-size: 12px; text-align: right; }
    .nav-card:hover .card-footer { color: #38bdf8; }
`;

// 스타일상자를 HTML에 동적으로 주입
const styleEl = document.createElement('style');
styleEl.innerHTML = homeStyles;
document.head.appendChild(styleEl);

// 홈 화면 컴포넌트 본체
function Home({ setPage }) {
    return (
        <div>
            <h1 style={{fontSize: '34px', margin: '10px 0 10px 0', fontWeight: 'bold'}}>금융 대시보드</h1>
            <p style={{color: '#94a3b8', fontSize: '18px', marginBottom: '10px'}}>나만의 투자 시나리오를 점검하고 시장의 방향성을 읽어보세요.</p>
            
            <div className="home-grid">
                
                {/* A. 시계열 계산기 카드 */}
                <div className="nav-card" onClick={() => setPage('calc')}>
                    <h3>A. 현금비중 시뮬레이터 📈</h3>
                    <p>조정장 발생 시 현금 비중 및 레버리지에 따른 장기 수익률(기울기) 변화를 시계열 차트로 직관적으로 비교합니다.</p>
                    <div className="card-footer">시뮬레이터 열기 →</div>
                </div>
                
                {/* C. 듀얼 모멘텀 카드 (이제 연결됨!) */}
                <div className="nav-card" onClick={() => setPage('dm')}>
                    <h3>C. 듀얼 모멘텀 분석기 🚦</h3>
                    <p>최근 12개월 수익률을 분석하여, 시장에 계속 머무를지 현금으로 대피할지 기계적인 투자 신호를 제공합니다.</p>
                    <div className="card-footer">분석기 열기 →</div>
                </div>
                
                {/* B. 올웨더 카드 (아직 준비 중) */}
                <div className="nav-card" onClick={() => alert('B페이지는 아직 준비 중입니다. 곧 추가될 예정입니다!')}>
                    <h3 style={{color: '#64748b'}}>B. 올웨더 리밸런싱 ⚖️</h3>
                    <p style={{color: '#64748b'}}>주식, 채권, 금의 목표 비중에 맞춰 현재 계좌의 최적 매수/매도 수량을 자동으로 계산해 줍니다.</p>
                    <div className="card-footer" style={{color: '#475569'}}>준비 중</div>
                </div>

            </div>
        </div>
    );
}
