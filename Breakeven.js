function Breakeven() {
    const { useState } = React;
    
    const [capital, setCapital] = useState(1000);
    const [upside, setUpside] = useState(10);
    const [cashRatio, setCashRatio] = useState(30);
    const [expectedDrop, setExpectedDrop] = useState(15);

    const [presetName, setPresetName] = useState('');
    const [presets, setPresets] = useState(() => {
        const saved = localStorage.getItem('finance_break_presets');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: '닷컴버블급 폭락', capital: 1000, upside: 15, cashRatio: 50, expectedDrop: 40 },
            { id: 2, name: '일반적인 줍줍장', capital: 1000, upside: 10, cashRatio: 20, expectedDrop: 10 }
        ];
    });

    const saveCurrentScenario = () => {
        if (!presetName.trim()) { alert('시나리오 이름을 입력해주세요!'); return; }
        const newPreset = { id: Date.now(), name: presetName, capital, upside, cashRatio, expectedDrop };
        const updated = [...presets, newPreset];
        setPresets(updated);
        localStorage.setItem('finance_break_presets', JSON.stringify(updated));
        setPresetName('');
    };

    const deleteScenario = (id, e) => {
        e.stopPropagation();
        const updated = presets.filter(p => p.id !== id);
        setPresets(updated);
        localStorage.setItem('finance_break_presets', JSON.stringify(updated));
    };

    const loadScenario = (p) => {
        setCapital(p.capital); setUpside(p.upside); setCashRatio(p.cashRatio); setExpectedDrop(p.expectedDrop);
    };

    // --- 수학 로직 ---
    // 1. A전략 (0% 현금 존버)
    const finalA = capital * (1 + (upside / 100));

    // 2. B전략 (예측 성공 시: 하락 후 반등)
    const stockPortion = capital * (1 - (cashRatio / 100));
    const cashPortion = capital * (cashRatio / 100);
    const droppedStockVal = stockPortion * (1 - (expectedDrop / 100));
    const recoveredVal = (droppedStockVal + cashPortion) / (1 - (expectedDrop / 100));
    const finalB = recoveredVal * (1 + (upside / 100));

    // ✨ 핵심 지표 1: Reward (예측 성공 시 얻는 초과 수익 = 알파)
    const rewardGain = finalB - finalA; 
    const isBWinning = rewardGain > 0;

    // ✨ 핵심 지표 2: Risk (예측 실패 시의 기회비용 손실)
    // 예측이 틀려서 시장이 하락 없이 즉시 상승(upside)해버렸을 때,
    // 현금으로 쥐고 있던 금액만큼 상승분을 못 먹게 되므로 그 차액이 손해(Risk)가 됨.
    const riskLoss = cashPortion * (upside / 100); 

    // ✨ 핵심 지표 3: 손익비 (Risk/Reward Ratio)
    // 리스크를 1로 두었을 때, 돌아오는 리워드의 배수
    const rrRatio = riskLoss > 0 ? (rewardGain / riskLoss).toFixed(2) : 0;

    return (
        <div className="fade-in">
            <h2 style={{fontSize: '32px', fontWeight: '800', marginBottom: '10px'}}>기회비용 vs 물타기 분석 ⚖️</h2>
            <p className="subtitle">예측 실패 시의 손해(Risk)와 성공 시의 초과수익(Reward) 손익비를 계산합니다.</p>

            <div className="break-layout">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card">
                        <div className="input-group">
                            <label>초기 자본금 (만 원)</label>
                            <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} />
                        </div>
                        <div className="input-group">
                            <label>목표 상승률 (%)</label>
                            <input type="number" value={upside} onChange={e => setUpside(Number(e.target.value))} />
                        </div>
                        <div className="input-group">
                            <label>보유 현금 비중 (%)</label>
                            <input type="number" value={cashRatio} onChange={e => setCashRatio(Number(e.target.value))} />
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label>기다리는 하락폭 (%)</label>
                            <input type="number" value={expectedDrop} onChange={e => setExpectedDrop(Number(e.target.value))} />
                        </div>
                    </div>

                    <div className="card" style={{ padding: '20px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>💾 시나리오 보관함</span>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <input 
                                type="text" value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="시나리오 이름" 
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: '14px' }}
                            />
                            <button className="btn" onClick={saveCurrentScenario} style={{ background: '#38bdf8', color: '#0b1120', fontSize: '13px', padding: '0 15px' }}>저장</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                            {presets.map(p => (
                                <div key={p.id} onClick={() => loadScenario(p)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155', cursor: 'pointer' }}>
                                    <span style={{ fontSize: '14px' }}>{p.name}</span>
                                    <button onClick={(e) => deleteScenario(p.id, e)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={`result-main ${isBWinning ? 'win-b' : 'win-a'}`} style={{justifyContent: 'flex-start'}}>
                    <div><div className="vs-badge">RISK / REWARD ANALYSIS</div></div>
                    
                    {/* 상단: 단순 승패 및 알파 금액 */}
                    <div style={{color: '#94a3b8', fontSize: '16px', marginTop: '10px'}}>현금 보유 전략의 예측 성공 시 초과수익</div>
                    <div className="alpha-val" style={{color: isBWinning ? '#34d399' : '#ef4444', margin: '10px 0'}}>
                        {isBWinning ? '+' : ''}{Math.round(rewardGain).toLocaleString()} <span style={{fontSize:'24px', fontWeight:'normal'}}>만원</span>
                    </div>

                    {/* ✨ 하단: 손익비 상세 계산 영역 */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px'}}>
                        
                        <div style={{display: 'flex', justifyContent: 'space-between', background: '#1e293b', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #ef4444', alignItems: 'center'}}>
                            <div style={{textAlign: 'left'}}>
                                <div style={{fontSize: '14px', color: '#94a3b8'}}>📉 내 예측이 틀렸을 때 (하락 없이 즉시 상승)</div>
                                <div style={{fontSize: '16px', fontWeight: 'bold', color: '#f8fafc', marginTop: '5px'}}>현금 보유로 인한 기회비용 (Risk)</div>
                            </div>
                            <div style={{fontSize: '24px', fontWeight: 'bold', color: '#ef4444'}}>-{Math.round(riskLoss).toLocaleString()}만</div>
                        </div>

                        <div style={{display: 'flex', justifyContent: 'space-between', background: '#1e293b', padding: '20px', borderRadius: '16px', borderLeft: `4px solid ${isBWinning ? '#34d399' : '#64748b'}`, alignItems: 'center'}}>
                            <div style={{textAlign: 'left'}}>
                                <div style={{fontSize: '14px', color: '#94a3b8'}}>📈 내 예측이 맞았을 때 (하락 후 반등)</div>
                                <div style={{fontSize: '16px', fontWeight: 'bold', color: '#f8fafc', marginTop: '5px'}}>물타기 성공 시 초과수익 (Reward)</div>
                            </div>
                            <div style={{fontSize: '24px', fontWeight: 'bold', color: isBWinning ? '#34d399' : '#64748b'}}>+{Math.round(Math.max(0, rewardGain)).toLocaleString()}만</div>
                        </div>

                        <div style={{background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #38bdf8', marginTop: '10px'}}>
                            <div style={{fontSize: '15px', color: '#94a3b8', marginBottom: '10px'}}>결론: 이 전략의 최종 손익비 (Risk : Reward)</div>
                            <div style={{fontSize: '32px', fontWeight: '800', color: rrRatio >= 2 ? '#38bdf8' : (rrRatio > 1 ? '#34d399' : '#ef4444')}}>
                                {isBWinning ? `1 : ${rrRatio}` : '분석 불가 (무조건 손실)'}
                            </div>
                            <div style={{fontSize: '13px', color: '#64748b', marginTop: '8px'}}>
                                {rrRatio >= 2 ? '훌륭한 자리입니다. 감수하는 리스크 대비 기대 수익이 매우 높습니다.' : 
                                 (rrRatio > 1 ? '나쁘지 않은 자리입니다. 얻을 수 있는 이익이 손해보다 큽니다.' : 
                                 '위험한 자리입니다. 하락을 기다리는 기회비용이 기대 수익보다 큽니다.')}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
