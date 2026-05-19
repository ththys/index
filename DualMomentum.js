const dmStyles = `
    .dm-layout { display: flex; flex-direction: column; gap: 30px; max-width: 1000px; margin: 0 auto; }
    .card { background-color: #1e293b; padding: 25px; border-radius: 16px; border: 1px solid #334155; }
    
    .input-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
    .asset-box { background: #0f172a; padding: 20px; border-radius: 12px; border: 1px solid #334155; position: relative; }
    .asset-box label { display: block; color: #94a3b8; font-size: 13px; font-weight: bold; margin-bottom: 8px; }
    .asset-box input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #475569; background-color: #1e293b; color: white; font-size: 16px; margin-bottom: 10px; }
    
    /* 신호등 결과 영역 */
    .signal-card { text-align: center; padding: 40px 20px; border-radius: 16px; margin-top: 10px; transition: 0.3s; border: 2px solid transparent; }
    .signal-card.risk-on { background: rgba(52, 211, 153, 0.1); border-color: #34d399; }
    .signal-card.risk-off { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; }
    
    .signal-status { font-size: 20px; font-weight: bold; margin-bottom: 15px; letter-spacing: 2px; }
    .risk-on .signal-status { color: #34d399; }
    .risk-off .signal-status { color: #ef4444; }
    
    .target-asset { font-size: 48px; font-weight: bold; color: #f8fafc; margin-bottom: 15px; }
    
    .logic-flow { display: flex; justify-content: center; gap: 15px; margin-top: 30px; flex-wrap: wrap; }
    .logic-step { background: #0f172a; padding: 15px 25px; border-radius: 8px; border: 1px solid #334155; flex: 1; min-width: 200px; text-align: left; }
    .step-title { color: #38bdf8; font-size: 13px; font-weight: bold; margin-bottom: 8px; }
    .step-desc { color: #e2e8f0; font-size: 15px; }
`;

const dmStyleEl = document.createElement('style');
dmStyleEl.innerHTML = dmStyles;
document.head.appendChild(dmStyleEl);

function DualMomentum() {
    const { useState } = React;

    // 자산 기본값 설정 (수익률은 보통 최근 12개월 수익률을 사용합니다)
    const [assetA, setAssetA] = useState({ name: 'S&P 500 (미국)', ret: 15.2 });
    const [assetB, setAssetB] = useState({ name: '글로벌 주식 (미국 제외)', ret: 4.5 });
    const [safeAsset, setSafeAsset] = useState({ name: '현금 / 초단기채', ret: 3.5 });

    // 1. 상대 모멘텀 계산 (A와 B 중 누가 더 잘 나가는가?)
    const isAGreater = assetA.ret >= assetB.ret;
    const relativeWinnerName = isAGreater ? assetA.name : assetB.name;
    const relativeWinnerRet = isAGreater ? assetA.ret : assetB.ret;

    // 2. 절대 모멘텀 계산 (잘 나가는 놈이 예금(현금) 이자보다 높은가?)
    const isRiskOn = relativeWinnerRet > safeAsset.ret;
    
    // 최종 투자 대상
    const finalTarget = isRiskOn ? relativeWinnerName : safeAsset.name;

    return (
        <div className="dm-layout">
            <div>
                <h2 style={{fontSize: '24px', marginBottom: '10px'}}>C. 듀얼 모멘텀 분석기 🚦</h2>
                <p style={{color: '#94a3b8', fontSize: '15px'}}>최근 12개월 수익률을 비교하여 '투자할지, 도망칠지' 기계적인 신호를 제공합니다.</p>
            </div>

            <div className="card">
                <h3 style={{marginBottom: '20px', fontSize: '16px', color: '#f8fafc'}}>최근 12개월 수익률 입력 (%)</h3>
                <div className="input-grid">
                    <div className="asset-box">
                        <label>📈 위험자산 A (예: 미국 주식)</label>
                        <input type="text" value={assetA.name} onChange={e => setAssetA({...assetA, name: e.target.value})} placeholder="자산 이름" />
                        <input type="number" value={assetA.ret} onChange={e => setAssetA({...assetA, ret: Number(e.target.value)})} />
                    </div>
                    <div className="asset-box">
                        <label>📊 위험자산 B (예: 글로벌 주식)</label>
                        <input type="text" value={assetB.name} onChange={e => setAssetB({...assetB, name: e.target.value})} placeholder="자산 이름" />
                        <input type="number" value={assetB.ret} onChange={e => setAssetB({...assetB, ret: Number(e.target.value)})} />
                    </div>
                    <div className="asset-box" style={{borderLeft: '3px solid #38bdf8'}}>
                        <label>🛡️ 안전자산 (비교 기준)</label>
                        <input type="text" value={safeAsset.name} onChange={e => setSafeAsset({...safeAsset, name: e.target.value})} placeholder="자산 이름" />
                        <input type="number" value={safeAsset.ret} onChange={e => setSafeAsset({...safeAsset, ret: Number(e.target.value)})} />
                    </div>
                </div>
            </div>

            {/* 신호등 결과 보드 */}
            <div className={`signal-card ${isRiskOn ? 'risk-on' : 'risk-off'}`}>
                <div className="signal-status">
                    {isRiskOn ? '🟢 RISK ON (공격 모드)' : '🔴 RISK OFF (방어 모드)'}
                </div>
                <div style={{color: '#94a3b8', marginBottom: '5px'}}>현재 포트폴리오를 다음 자산 100%로 교체하세요:</div>
                <div className="target-asset">{finalTarget}</div>
            </div>

            {/* 알고리즘 설명 */}
            <div className="logic-flow">
                <div className="logic-step">
                    <div className="step-title">STEP 1. 상대 모멘텀</div>
                    <div className="step-desc">
                        {assetA.name}({assetA.ret}%) vs {assetB.name}({assetB.ret}%)<br/>
                        👉 <b>{relativeWinnerName}</b> 승리!
                    </div>
                </div>
                <div className="logic-step">
                    <div className="step-title">STEP 2. 절대 모멘텀</div>
                    <div className="step-desc">
                        승자({relativeWinnerRet}%) vs 안전자산({safeAsset.ret}%)<br/>
                        👉 {isRiskOn ? '안전자산 이자보다 높으므로 투자 유지!' : '안전자산 이자보다 낮으므로 전량 매도 후 대피!'}
                    </div>
                </div>
            </div>
        </div>
    );
}
