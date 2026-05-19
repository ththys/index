function DualMomentum() {
    const { useState } = React;
    const [assetA, setAssetA] = useState({ name: 'S&P 500 (미국)', ret: 15.2 });
    const [assetB, setAssetB] = useState({ name: '글로벌 주식', ret: 4.5 });
    const [safeAsset, setSafeAsset] = useState({ name: '현금 / 초단기채', ret: 3.5 });

    const isAGreater = assetA.ret >= assetB.ret;
    const relativeWinnerName = isAGreater ? assetA.name : assetB.name;
    const relativeWinnerRet = isAGreater ? assetA.ret : assetB.ret;
    const isRiskOn = relativeWinnerRet > safeAsset.ret;
    const finalTarget = isRiskOn ? relativeWinnerName : safeAsset.name;

    const styles = `
        .dm-layout { display: flex; flex-direction: column; gap: 30px; }
        .card { background-color: #1e293b; padding: 30px; border-radius: 20px; border: 1px solid #334155; }
        .input-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .asset-box { background: #0f172a; padding: 20px; border-radius: 16px; border: 1px solid #334155; }
        .asset-box label { display: block; color: #94a3b8; font-size: 14px; font-weight: bold; margin-bottom: 10px; }
        .asset-box input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #475569; background-color: #1e293b; color: white; font-size: 16px; margin-bottom: 10px; }
        .signal-card { text-align: center; padding: 50px 20px; border-radius: 20px; margin-top: 10px; border: 2px solid transparent; }
        .risk-on { background: rgba(52, 211, 153, 0.05); border-color: #34d399; }
        .risk-off { background: rgba(239, 68, 68, 0.05); border-color: #ef4444; }
        .signal-status { font-size: 24px; font-weight: bold; margin-bottom: 15px; letter-spacing: 2px; }
        .risk-on .signal-status { color: #34d399; }
        .risk-off .signal-status { color: #ef4444; }
        .target-asset { font-size: 56px; font-weight: 800; color: #f8fafc; }
    `;

    return (
        <div className="fade-in dm-layout">
            <style>{styles}</style>
            <div>
                <h2 style={{fontSize: '32px', fontWeight: '800', marginBottom: '10px'}}>듀얼 모멘텀 분석기 🚦</h2>
                <p style={{color: '#94a3b8', fontSize: '18px'}}>최근 12개월 수익률을 비교하여 기계적인 투자 신호를 제공합니다.</p>
            </div>

            <div className="card">
                <div className="input-grid">
                    <div className="asset-box">
                        <label>📈 위험자산 A</label>
                        <input type="text" value={assetA.name} onChange={e => setAssetA({...assetA, name: e.target.value})} />
                        <input type="number" value={assetA.ret} onChange={e => setAssetA({...assetA, ret: Number(e.target.value)})} />
                    </div>
                    <div className="asset-box">
                        <label>📊 위험자산 B</label>
                        <input type="text" value={assetB.name} onChange={e => setAssetB({...assetB, name: e.target.value})} />
                        <input type="number" value={assetB.ret} onChange={e => setAssetB({...assetB, ret: Number(e.target.value)})} />
                    </div>
                    <div className="asset-box" style={{borderLeft: '4px solid #38bdf8'}}>
                        <label>🛡️ 안전자산 (비교 기준)</label>
                        <input type="text" value={safeAsset.name} onChange={e => setSafeAsset({...safeAsset, name: e.target.value})} />
                        <input type="number" value={safeAsset.ret} onChange={e => setSafeAsset({...safeAsset, ret: Number(e.target.value)})} />
                    </div>
                </div>
            </div>

            <div className={`signal-card ${isRiskOn ? 'risk-on' : 'risk-off'}`}>
                <div className="signal-status">{isRiskOn ? '🟢 RISK ON (공격 모드)' : '🔴 RISK OFF (방어 모드)'}</div>
                <div style={{color: '#94a3b8', marginBottom: '10px'}}>현재 포트폴리오를 다음 자산 100%로 교체하세요:</div>
                <div className="target-asset">{finalTarget}</div>
            </div>
        </div>
    );
}
