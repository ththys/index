function Breakeven() {
    const { useState } = React;
    
    const [capital, setCapital] = useState(1000);
    const [upside, setUpside] = useState(10);
    const [cashRatio, setCashRatio] = useState(30);
    const [expectedDrop, setExpectedDrop] = useState(15);
    const [probDrop, setProbDrop] = useState(50);

    const [presets, setPresets] = useState(() => {
        const saved = localStorage.getItem('finance_break_presets');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: '닷컴버블급 폭락', capital: 1000, upside: 15, cashRatio: 50, expectedDrop: 40, probDrop: 70 },
            { id: 2, name: '일반적인 조정장', capital: 1000, upside: 10, cashRatio: 20, expectedDrop: 10, probDrop: 50 }
        ];
    });
    const [presetName, setPresetName] = useState('');

    const saveCurrentScenario = () => {
        if (!presetName.trim()) { alert('시나리오 이름을 입력해주세요!'); return; }
        const newPreset = { id: Date.now(), name: presetName, capital, upside, cashRatio, expectedDrop, probDrop };
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
        if(p.probDrop) setProbDrop(p.probDrop);
    };

    // --- 🧮 수학 로직 ---
    const R = cashRatio / 100;
    const U = upside / 100;
    const D = expectedDrop / 100;
    const P = probDrop / 100;

    // A전략 (100% 주식)
    const finalA = capital * (1 + U);
    
    // B전략 (현금 보유, 상승 시)
    const finalB_UpOnly = (capital * (1 - R) * (1 + U)) + (capital * R);
    
    // 기회비용 (Cash Drag)
    const riskDrag = finalA - finalB_UpOnly; 

    // 하락 시 타격 (Drawdown)
    const riskDrawdown = capital * (1 - R) * D; 
    const totalRisk = riskDrag + riskDrawdown;

    // B전략 물타기 성공 시 (하락 후 반등)
    const recoveredStockVal = (capital * (1 - R) * (1 - D) + capital * R) / (1 - D);
    const finalB_Success = recoveredStockVal * (1 + U);
    const rewardAlpha = finalB_Success - finalA;

    const expectedValue = (rewardAlpha * P) - (riskDrag * (1 - P));
    const breakevenProb = (riskDrag / (rewardAlpha + riskDrag) * 100).toFixed(1);
    const rrRatio = totalRisk > 0 ? (rewardAlpha / totalRisk).toFixed(2) : 0;

    return (
        <div className="fade-in">
            <h2>전략 의사결정 분석기 (EV 모델) ⚖️</h2>
            <p className="subtitle">손익비와 확률을 결합하여 '현금 보유'의 수학적 기댓값을 산출합니다.</p>

            <div className="break-layout">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card">
                        <div className="input-group">
                            <label>초기 자본금 (만 원)</label>
                            <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} />
                        </div>
                        <div className="input-group">
                            <label>목표 상승률 (%) / 하락폭 (%)</label>
                            <div style={{display:'flex', gap:'10px'}}>
                                <input type="number" value={upside} onChange={e => setUpside(Number(e.target.value))} placeholder="상승" />
                                <input type="number" value={expectedDrop} onChange={e => setExpectedDrop(Number(e.target.value))} placeholder="하락" />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>보유 현금 비중 (%)</label>
                            <input type="number" value={cashRatio} onChange={e => setCashRatio(Number(e.target.value))} />
                        </div>
                        <div className="input-group" style={{marginBottom: 0}}>
                            <label style={{color: '#38bdf8'}}>⚠️ 내가 생각하는 하락 확률: {probDrop}%</label>
                            <input type="range" min="0" max="100" value={probDrop} onChange={e => setProbDrop(Number(e.target.value))} style={{cursor:'pointer', width:'100%'}} />
                            <div style={{display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#475569', marginTop:'5px'}}>
                                <span>상승 확신 (0%)</span>
                                <span>하락 확신 (100%)</span>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <span className="scenario-header">💾 시나리오 보관함</span>
                        <div className="scenario-input-row">
                            <input type="text" className="scenario-input" value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="시나리오 이름" />
                            <button className="btn btn-save" onClick={saveCurrentScenario}>저장</button>
                        </div>
                        <div className="scenario-list">
                            {presets.map(p => (
                                <div key={p.id} className="scenario-item" onClick={() => loadScenario(p)}>
                                    <span style={{ fontSize: '14px' }}>{p.name}</span>
                                    <button className="btn-delete" onClick={(e) => deleteScenario(p.id, e)}>✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={`result-main ${expectedValue > 0 ? 'win-b' : 'win-a'}`} style={{justifyContent: 'flex-start', padding: '30px'}}>
                    
                    {/* ✨ 따로 빼달라고 하신 100% 매수 vs 기회비용 비교 블록 */}
                    <div style={{background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155', marginBottom: '25px', textAlign: 'left'}}>
                        <div style={{fontSize: '14px', color: '#94a3b8', marginBottom: '15px'}}>📈 하락 없이 {upside}% 즉시 상승 시 (예측 실패)</div>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px'}}>
                            <div>
                                <div style={{fontSize: '12px', color: '#64748b'}}>A전략 (100% 풀매수)</div>
                                <div style={{fontSize: '20px', fontWeight: 'bold', color: '#f8fafc'}}>{Math.round(finalA).toLocaleString()}만</div>
                            </div>
                            <div style={{textAlign: 'right'}}>
                                <div style={{fontSize: '12px', color: '#f59e0b'}}>현금 보유 시 놓치는 기회비용 (Drag)</div>
                                <div style={{fontSize: '22px', fontWeight: 'bold', color: '#f59e0b'}}>-{Math.round(riskDrag).toLocaleString()}만</div>
                            </div>
                        </div>
                    </div>

                    <div style={{borderBottom: '1px dashed #334155', marginBottom: '25px'}}></div>

                    {/* 기존 하락 물타기 알파 및 EV 분석 블록 */}
                    <div><div className="vs-badge">PROBABILITY-BASED EXPECTANCY</div></div>
                    
                    <div className="risk-title" style={{marginTop: '10px'}}>이 포지션의 수학적 기댓값(EV)</div>
                    <div className="alpha-val" style={{color: expectedValue > 0 ? '#34d399' : '#ef4444', margin: '10px 0'}}>
                        {expectedValue > 0 ? '+' : ''}{Math.round(expectedValue).toLocaleString()} <span style={{fontSize:'24px', fontWeight:'normal'}}>만원</span>
                    </div>

                    <div className="risk-breakdown">
                        <div className="final-conclusion" style={{borderColor: expectedValue > 0 ? '#34d399' : '#ef4444'}}>
                            <div className="risk-title" style={{marginBottom: '8px'}}>의사결정 가이드</div>
                            <div style={{fontSize: '20px', fontWeight: 'bold', color: '#f8fafc'}}>
                                {expectedValue > 0 ? "현금 보유가 유리함 (Bet)" : "지금 다 사는 게 유리함 (Fold)"}
                            </div>
                            <div className="risk-desc" style={{fontSize: '14px', color: '#e2e8f0', marginTop: '12px', lineHeight: '1.6'}}>
                                손익분기 확률 <b>{breakevenProb}%</b> 이상일 때만 현금 보유가 수학적으로 정당화됩니다.<br/>
                                (총 리스크 대비 보상 배수 = 1 : {rrRatio})
                            </div>
                        </div>

                        <div className="risk-grid">
                            <div className="risk-card" style={{borderTop: '4px solid #34d399'}}>
                                <div className="risk-title">하락 후 반등 시 찐 수익 (Alpha)</div>
                                <div className="risk-value" style={{color: '#34d399'}}>+{Math.round(rewardAlpha).toLocaleString()}만</div>
                            </div>
                            <div className="risk-card drawdown">
                                <div className="risk-title">하락 시 내 주식 타격 (Drawdown)</div>
                                <div className="risk-value" style={{color: '#ef4444'}}>-{Math.round(riskDrawdown).toLocaleString()}만</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
