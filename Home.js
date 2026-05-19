// 홈 화면 전용 스타일 주입
const homeStyles = `
    .home-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 25px; margin-top: 30px; }
    .nav-card { 
        background-color: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 35px; 
        cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
        display: flex; flex-direction: column; height: 260px; justify-content: space-between;
    }
    .nav-card:hover { transform: translateY(-8px); border-color: #38bdf8; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4); }
    .nav-card h3 { color: #38bdf8; font-size: 22px; margin-bottom: 15px; font-weight: 700; }
    .nav-card p { color: #94a3b8; font-size: 15px; line-height: 1.6; }
    .card-footer { margin-top: 20px; font-size: 14px; color: #475569; font-weight: bold; text-align: right; }
    .nav-card:hover .card-footer { color: #38bdf8; }
`;

const styleLink = document.createElement('style');
styleLink.innerHTML = homeStyles;
document.head.appendChild(styleLink);

function Home({ setPage }) {
    return (
        <div className="fade-in">
            <h1 style={{fontSize: '36px', fontWeight: '800', marginBottom: '10px'}}>금융 대시보드</h1>
            <p style={{color: '#94a3b8', fontSize: '18px', marginBottom: '40px'}}>데이터 기반 시뮬레이션으로 투자 의사결정을 최적화하세요.</p>
            
            <div className="home-grid">
                {/* 손익분기 분석 카드 */}
                <div className="nav-card" onClick={() => setPage('break')}>
                    <div>
                        <h3>손익분기 분석 ⚖️</h3>
                        <p>시장 상승을 놓치는 '기회비용'과 하락 후 물타기로 얻는 '알파'의 손익분기점을 비교합니다.</p>
                    </div>
                    <div className="card-footer">분석 시작하기 →</div>
                </div>

                {/* 시뮬레이터 카드 */}
                <div className="nav-card" onClick={() => setPage('calc')}>
                    <div>
                        <h3>시계열 시뮬레이터 📈</h3>
                        <p>여러 시나리오에 따른 현금 비중 변화가 자산의 장기 성장 곡선(기울기)에 미치는 영향을 분석합니다.</p>
                    </div>
                    <div className="card-footer">시뮬레이션 실행 →</div>
                </div>

                {/* 듀얼 모멘텀 카드 */}
                <div className="nav-card" onClick={() => setPage('dm')}>
                    <div>
                        <h3>듀얼 모멘텀 🚦</h3>
                        <p>상대적/절대적 모멘텀 수치를 통해 시장 참여 여부를 판단하는 기계적 신호를 제공합니다.</p>
                    </div>
                    <div className="card-footer">신호 확인하기 →</div>
                </div>
            </div>
        </div>
    );
}
