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

    // --- 🧮 수학 로직 ---
    const R = cashRatio / 100;
    const U = upside / 100;
    const D = expectedDrop / 100;

    const riskDrag = capital * R * U;
    const riskDrawdown = capital * (1 - R) * D;
    const totalRisk = riskDrag + riskDrawdown;

    const finalA = capital * (1 + U);
    const recoveredStockVal = (capital * (1 - R) * (1 - D) + capital * R) / (1 - D);
    const finalB = recoveredStockVal * (1 + U);
    const rewardAlpha = finalB - finalA;

    const rrRatio = totalRisk > 0 ? (rewardAlpha / totalRisk).toFixed(2) : 0;
    const isBWinning = rewardAlpha > 0;

    return (
        <div className="fade-in">
            <h2>기회비용 vs 물타기 분석 ⚖️</h2>
            <p className="subtitle">현금 비중에 따른 리스크(Drag + Drawdown) 대비 보상 배수를 분석합니다.</p>

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

                    <div className="card">
                        <span className="scenario-header">💾 시나리오 보관함</span>
                        <div className="scenario-input-row">
                            <input 
                                type="text" className="scenario-input" value={presetName} 
                                onChange={e => setPresetName(e.target.value)} placeholder="시나리오 이름" 
                            />
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

                <div className={`result-main ${isBWinning ? 'win-b' : 'win-a'}`} style={{justifyContent: 'flex-start'}}>
                    <div><div className="vs-badge">REAL-TIME RISK/REWARD MODEL</div></div>
                    
                    <div className="risk-title" style={{marginTop: '10px'}}>예측 적중 시 발생하는 순수 초과수익(Reward)</div>
                    <div className="alpha-val" style={{color: isBWinning ? '#34d399' : '#ef4444', margin: '10px 0'}}>
                        {isBWinning ? '+' : ''}{Math.round(rewardAlpha).toLocaleString()} <span style={{fontSize:'24px', fontWeight:'normal'}}>만원</span>
                    </div>

                    <div className="risk-breakdown">
                        <div className="risk-grid">
                            <div className="risk-card drag">
                                <div className="risk-title">기회비용 (Drag)</div>
                                <div className="risk-value" style={{color: '#f59e0b'}}>-{Math.round(riskDrag).toLocaleString()}만</div>
                                <div className="risk-desc">상승을 놓칠 위험</div>
                            </div>
                            <div className="risk-card drawdown">
                                <div className="risk-title">실제 타격 (Drawdown)</div>
                                <div className="risk-value" style={{color: '#ef4444'}}>-{Math.round(riskDrawdown).toLocaleString()}만</div>
                                <div className="risk-desc">하락을 견뎌야 할 고통</div>
                            </div>
                        </div>

                        <div className="final-conclusion">
                            <div className="risk-title" style={{marginBottom: '8px'}}>총 리스크 대비 보상 배수</div>
                            <div className="final-ratio">1 : {rrRatio}</div>
                            <div className="risk-desc" style={{fontSize: '14px', color: '#e2e8f0', marginTop: '12px', lineHeight: '1.5'}}>
                                현금 비중 <b>{cashRatio}%</b> 세팅 시,<br/> 
                                총 <b>{Math.round(totalRisk).toLocaleString()}만 원</b>의 복합 리스크를 감수하고<br/>
                                <b>{Math.round(rewardAlpha).toLocaleString()}만 원</b>의 알파 수익을 노립니다.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
