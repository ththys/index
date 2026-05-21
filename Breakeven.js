function Breakeven() {
    const { useState } = React;
    
    const [capital, setCapital] = useState(1000);
    const [upside, setUpside] = useState(10);
    const [cashRatio, setCashRatio] = useState(30);
    const [expectedDrop, setExpectedDrop] = useState(15);
    const [probDrop, setProbDrop] = useState(50);
    const [presetName, setPresetName] = useState('');

    const [presets, setPresets] = useState(() => {
        const saved = localStorage.getItem('finance_break_presets');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: '닷컴버블급 폭락 시나리오', capital: 1000, upside: 15, cashRatio: 50, expectedDrop: 40, probDrop: 70 },
            { id: 2, name: '일반적인 조정장 시나리오', capital: 1000, upside: 10, cashRatio: 20, expectedDrop: 10, probDrop: 50 }
        ];
    });

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
        if(p.probDrop !== undefined) setProbDrop(p.probDrop);
    };

    // ✨ NaN 에러 방지 처리 완료 (p.probDrop이 없으면 기본값 50 적용)
    const calculateMetrics = (p) => {
        const R = (p.cashRatio || 0) / 100;
        const U = (p.upside || 0) / 100;
        const D = (p.expectedDrop || 0) / 100;
        const P = (p.probDrop !== undefined ? p.probDrop : 50) / 100; 

        const finalA = p.capital * (1 + U);
        const finalB_UpOnly = (p.capital * (1 - R) * (1 + U)) + (p.capital * R);
        const riskDrag = finalA - finalB_UpOnly; 
        const riskDrawdown = p.capital * (1 - R) * D; 
        const totalRisk = riskDrag + riskDrawdown;

        const recoveredStockVal = (p.capital * (1 - R) * (1 - D) + p.capital * R) / (1 - D);
        const finalB_Success = recoveredStockVal * (1 + U);
        const rewardAlpha = finalB_Success - finalA;

        const expectedValue = (rewardAlpha * P) - (riskDrag * (1 - P));
        const breakevenProb = (rewardAlpha + riskDrag) > 0 ? (riskDrag / (rewardAlpha + riskDrag) * 100).toFixed(1) : 0;
        const rrRatio = totalRisk > 0 ? (rewardAlpha / totalRisk).toFixed(2) : '0.00';

        return { finalA, riskDrag, riskDrawdown, rewardAlpha, expectedValue, breakevenProb, rrRatio };
    };

    const curMetrics = calculateMetrics({ capital, upside, cashRatio, expectedDrop, probDrop });
    const isCurPositive = curMetrics.expectedValue > 0;

    return (
        <div className="fade-in">
            <div>
                <h2>전략 의사결정 분석기 (EV 모델) ⚖️</h2>
                <p className="subtitle">손익비와 확률을 결합하여 수학적 기댓값을 산출합니다.</p>
            </div>

            {/* ✨ 좌측 입력창 폭을 260px로 확 줄임 */}
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '15px', marginBottom: '15px' }}>
                
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>⚙️ 자본 및 환경 설정</div>
                    <div className="input-group" style={{ margin: 0 }}><label>초기 자본금 (만원)</label><input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} /></div>
                    <div className="input-group" style={{ margin: 0 }}>
                        <label>목표 상승(%) / 예상 하락(%)</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="number" value={upside} onChange={e => setUpside(Number(e.target.value))} />
                            <input type="number" value={expectedDrop} onChange={e => setExpectedDrop(Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="input-group" style={{ margin: 0 }}><label>보유 현금 비중 (%)</label><input type="number" value={cashRatio} onChange={e => setCashRatio(Number(e.target.value))} /></div>
                    <div className="input-group" style={{ margin: 0, marginTop: '5px' }}>
                        <label style={{ color: '#38bdf8' }}>⚠️ 하락 확률: {probDrop}%</label>
                        <input type="range" min="0" max="100" value={probDrop} onChange={e => setProbDrop(Number(e.target.value))} style={{ width: '100%', marginTop: '5px' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#475569', marginTop: '3px' }}><span>0%</span><span>100%</span></div>
                    </div>
                </div>

                {/* ✨ 우측 패딩과 폰트 사이즈 대폭 축소 */}
                <div className={`result-main ${isCurPositive ? 'win-b' : 'win-a'}`} style={{ padding: '20px', justifyContent: 'center' }}>
                    <div><div className="vs-badge">REAL-TIME EXPECTANCY</div></div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>현재 세팅 기댓값(EV)</div>
                    <div style={{ color: isCurPositive ? '#34d399' : '#ef4444', margin: '5px 0 15px 0', fontSize: '32px', fontWeight: '800' }}>
                        {isCurPositive ? '+' : ''}{Math.round(curMetrics.expectedValue).toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>만원</span>
                    </div>

                    <div style={{ border: `1px solid ${isCurPositive ? '#34d399' : '#ef4444'}`, background: '#0f172a', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f8fafc' }}>{isCurPositive ? "✅ 현금 보유 유리 (Bet)" : "🚨 즉시 매수 유리 (Fold)"}</div>
                        <div style={{ fontSize: '11px', color: '#e2e8f0', marginTop: '6px' }}>
                            손익분기 확률 <b>{curMetrics.breakevenProb}%</b> 이상 필요 <span style={{ color: '#64748b' }}>(배수 1:{curMetrics.rrRatio})</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', borderTop: '2px solid #34d399', textAlign: 'left' }}>
                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>물타기 알파</div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#34d399' }}>+{Math.round(curMetrics.rewardAlpha).toLocaleString()}만</div>
                        </div>
                        <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', borderTop: '2px solid #f59e0b', textAlign: 'left' }}>
                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>기회비용 (Drag)</div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f59e0b' }}>-{Math.round(curMetrics.riskDrag).toLocaleString()}만</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✨ 하단 테이블 셀 패딩 축소 및 폰트 축소 */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ background: '#1e293b', padding: '12px 15px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>📊 시나리오 보관함 대조</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="text" value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="이름 지정" style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: 'white', fontSize: '11px', width: '150px' }} />
                        <button className="btn btn-save" onClick={saveCurrentScenario} style={{ padding: '6px 10px', fontSize: '11px' }}>+ 저장</button>
                    </div>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px', minWidth: '700px' }}>
                        <thead>
                            <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                                <th style={{ padding: '10px' }}>케이스명</th>
                                <th style={{ padding: '10px', textAlign: 'right', color: '#f59e0b' }}>기회비용</th>
                                <th style={{ padding: '10px', textAlign: 'right', color: '#ef4444' }}>하락타격</th>
                                <th style={{ padding: '10px', textAlign: 'right', color: '#34d399' }}>알파</th>
                                <th style={{ padding: '10px', textAlign: 'right', color: '#38bdf8' }}>본전확률</th>
                                <th style={{ padding: '10px', textAlign: 'right' }}>기댓값(EV)</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>삭제</th>
                            </tr>
                        </thead>
                        <tbody>
                            {presets.map(p => {
                                const m = calculateMetrics(p);
                                const isPos = m.expectedValue > 0;
                                return (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #1e293b', background: isPos ? 'rgba(52, 211, 153, 0.02)' : 'rgba(239, 68, 68, 0.02)', cursor: 'pointer' }} onClick={() => loadScenario(p)}>
                                        <td style={{ padding: '10px' }}>
                                            <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '12px' }}>{p.name}</div>
                                            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>현금{p.cashRatio}% / 상승{p.upside}% / 하락{p.expectedDrop}% / 확신{p.probDrop ?? 50}%</div>
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'right', color: '#f59e0b' }}>-{Math.round(m.riskDrag).toLocaleString()}만</td>
                                        <td style={{ padding: '10px', textAlign: 'right', color: '#ef4444' }}>-{Math.round(m.riskDrawdown).toLocaleString()}만</td>
                                        <td style={{ padding: '10px', textAlign: 'right', color: '#34d399' }}>+{Math.round(m.rewardAlpha).toLocaleString()}만</td>
                                        <td style={{ padding: '10px', textAlign: 'right', color: '#38bdf8', fontWeight: 'bold' }}>{m.breakevenProb}%</td>
                                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: isPos ? '#34d399' : '#ef4444', fontSize: '13px' }}>
                                            {isPos ? '+' : ''}{Math.round(m.expectedValue).toLocaleString()}만
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}><button className="btn-delete" onClick={(e) => deleteScenario(p.id, e)}>✕</button></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
