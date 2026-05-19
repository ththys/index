function Home({ setPage }) {
    return (
        <div className="fade-in">
            <h1>금융 대시보드</h1>
            <p className="subtitle">데이터 기반 시뮬레이션으로 투자 의사결정을 최적화하세요.</p>
            
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
