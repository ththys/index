// 홈 화면 전용 스타일 정의
const homeStyles = `
    .home-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 30px; }
    .nav-card { background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 30px; cursor: pointer; transition: 0.2s; }
    .nav-card:hover { transform: translateY(-5px); background-color: #334155; border-color: #38bdf8; }
    .nav-card h3 { color: #38bdf8; margin-bottom: 10px; font-size: 20px; }
    .nav-card p { color: #94a3b8; font-size: 14px; }
`;

// 스타일상자를 HTML에 동적으로 주입
const styleEl = document.createElement('style');
styleEl.innerHTML = homeStyles;
document.head.appendChild(styleEl);

// 홈 화면 컴포넌트 본체
function Home({ setPage }) {
    return (
        <div>
            <h1 style={{fontSize: '32px', margin: '10px 0 5px 0'}}>금융 대시보드</h1>
            <p style={{color: '#94a3b8', fontSize: '18px'}}>오늘의 투자 시나리오를 점검해 보세요.</p>
            
            <div className="home-grid">
                <div className="nav-card" onClick={() => setPage('calc')}>
                    <h3>A. 현금비중 시뮬레이터 📈</h3>
                    <p>조정장 발생 시 현금 비중 및 레버리지에 따른 장기 수익률(기울기) 변화를 시계열로 비교합니다.</p>
                </div>
                
                <div className="nav-card" onClick={() => alert('준비 중입니다.')}>
                    <h3 style={{color: '#94a3b8'}}>B. 올웨더 리밸런싱 ⚖️</h3>
                    <p>주식, 채권, 금의 목표 비중에 맞춰 최적의 매수/매도 수량을 계산해 줍니다.</p>
                </div>
                
                <div className="nav-card" onClick={() => alert('준비 중입니다.')}>
                    <h3 style={{color: '#94a3b8'}}>C. 듀얼 모멘텀 분석 🚦</h3>
                    <p>최근 수익률을 기반으로 주식을 유지할지 현금으로 대피할지 신호를 제공합니다.</p>
                </div>
            </div>
        </div>
    );
}
