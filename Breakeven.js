function Breakeven() {
    const { useState } = React;
    
    // 기본 입력값 상태
    const [capital, setCapital] = useState(1000);
    const [upside, setUpside] = useState(10);
    const [cashRatio, setCashRatio] = useState(30);
    const [expectedDrop, setExpectedDrop] = useState(15);

    // 시나리오 저장용 상태 (로컬 스토리지)
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

    // --- 🧮 정교화된 자산배분 손익비 로직 ---
    const R = cashRatio / 100;
    const U = upside / 100;
    const D = expectedDrop / 100;

    // 1. 기회비용 리스크 (Risk: Cash Drag)
    // 틀렸을 때(즉시 상승 시) 현금 때문에 못 번 돈
    const riskDrag = capital * R * U;

    // 2. 실질 하락 리스크 (Risk: Drawdown)
    // 맞았을 때(하락 시) 바닥까지 가면서 내 주식이 실제로 까이는 돈
    const riskDrawdown = capital * (1 - R) * D;

    // 3. 총 리스크 (Total Combined Risk)
    const totalRisk = riskDrag + riskDrawdown;

    // 4. 물타기 초과 수익 (Reward: Alpha)
    // 예측 성공 후 반등 시 '존버' 대비 더 벌게 되는 순수 알파
    const finalA = capital * (1 + U);
    const recoveredStockVal = (capital * (1 - R) * (1 - D) + capital * R) / (1 - D);
    const finalB = recoveredStockVal * (1 + U);
    const rewardAlpha = finalB - finalA;

    // 5. 최종 실질 손익비 (Real Risk/Reward Ratio)
    // 분모에 R(현금비중)이 포함된 두 리스크의 합을 넣어 비중 변화를 반영
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
                    <div><div className="vs-badge">REAL-TIME RISK/REWARD MODEL</div></div>
                    
                    <div style={{color: '#94a3b8', fontSize: '16px', marginTop: '10px'}}>예측 적중 시 발생하는 순수 초과수익(Reward)</div>
                    <div className="alpha-val" style={{color: isBWinning ? '#34d399' : '#ef4444', margin: '10px 0'}}>
                        {isBWinning ? '+' : ''}{Math.round(rewardAlpha).toLocaleString()} <span style={{fontSize:'24px', fontWeight:'normal'}}>만원</span>
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px'}}>
                        
                        {/* 리스크 해부 보드 */}
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                            <div style={{background: '#1e293b', padding: '15px', borderRadius: '16px', borderTop: '4px solid #f59e0b', textAlign: 'left'}}>
                                <div style={{fontSize: '12px', color: '#94a3b8'}}>기회비용 (Drag)</div>
                                <div style={{fontSize: '18px', fontWeight: 'bold', color: '#f59e0b', marginTop: '5px'}}>-{Math.round(riskDrag).toLocaleString()}만</div>
                                <div style={{fontSize: '11px', color: '#475569', marginTop: '3px'}}>상승을 놓칠 위험</div>
                            </div>
                            <div style={{background: '#1e293b', padding: '15px', borderRadius: '16px', borderTop: '4px solid #ef4444', textAlign: 'left'}}>
                                <div style={{fontSize: '12px', color: '#94a3b8'}}>실제 타격 (Drawdown)</div>
                                <div style={{fontSize: '18px', fontWeight: 'bold', color: '#ef4444', marginTop: '5px'}}>-{Math.round(riskDrawdown).toLocaleString()}만</div>
                                <div style={{fontSize: '11px', color: '#475569', marginTop: '3px'}}>하락을 견뎌야 할 고통</div>
                            </div>
                        </div>

                        {/* 최종 손익비 결론 */}
                        <div style={{background: '#0f172a', padding: '25px', borderRadius: '20px', border: '1px solid #38bdf8', marginTop: '10px', textAlign: 'center'}}>
                            <div style={{fontSize: '15px', color: '#94a3b8', marginBottom: '8px'}}>총 리스크($Risk_{Total}$) 대비 보상($Reward$)</div>
                            <div style={{fontSize: '42px', fontWeight: '800', color: '#38bdf8'}}>
                                1 : {rrRatio}
                            </div>
                            <div style={{fontSize: '14px', color: '#e2e8f0', marginTop: '12px', lineHeight: '1.5'}}>
                                현금 비중 <b>{cashRatio}%</b> 세팅 시,<br/> 
                                총 <b>{Math.round(totalRisk).toLocaleString()}만 원</b>의 복합 리스크를 감수하고<br/>
                                <b>{Math.round(rewardAlpha).toLocaleString()}만 원</b>의 알파 수익을 노리는 매치입니다.
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
