function Breakeven() {
    const { useState } = React;
    
    // 1. 상태 관리
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

    // 2. 실시간 연산 헬퍼 (현재 화면 & 테이블 렌더링용 공통 로직)
    const calculateMetrics = (p) => {
        const R = p.cashRatio / 100;
        const U = p.upside / 100;
        const D = p.expectedDrop / 100;
        const P = p.probDrop / 100;

        const finalA = p.capital * (1 + U);
        const finalB_UpOnly = (p.capital * (1 - R) * (1 + U)) + (p.capital * R);
        const riskDrag = finalA - finalB_UpOnly; 
        const riskDrawdown = p.capital * (1 - R) * D; 
        const totalRisk = riskDrag + riskDrawdown;

        const recoveredStockVal = (p.capital * (1 - R) * (1 - D) + p.capital * R) / (1 - D);
        const finalB_Success = recoveredStockVal * (1 + U);
        const rewardAlpha = finalB_Success - finalA;

        const expectedValue = (rewardAlpha * P) - (riskDrag * (1 - P));
        const breakevenProb = (riskDrag / (rewardAlpha + riskDrag) * 100).toFixed(1);
        const rrRatio = totalRisk > 0 ? (rewardAlpha / totalRisk).toFixed(2) : '0.00';

        return { finalA, riskDrag, riskDrawdown, rewardAlpha, expectedValue, breakevenProb, rrRatio };
    };

    // 현재 상단 입력창 기준의 실시간 결과
    const curMetrics = calculateMetrics({ capital, upside, cashRatio, expectedDrop, probDrop });
    const isCurPositive = curMetrics.expectedValue > 0;

    return (
        <div className="fade-in">
            <div>
                <h2>전략 의사결정 분석기 (EV 모델) ⚖️</h2>
                <p className="subtitle">손익비와 확률을 결합하여 '현금 보유'의 수학적 기댓값을 산출합니다.</p>
            </div>

            {/* ✨ 1. 상단: 좌측(설정) + 우측(결과) 그리드 배치 */}
            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '25px', marginBottom: '25px' }}>
                
                {/* 좌측: 자본 및 환경 설정 */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ fontSize: '15px', color: '#94a3b8', fontWeight: 'bold', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>⚙️ 자본 및 환경 설정</div>
                    
                    <div className="input-group" style={{ margin: 0 }}>
                        <label>초기 자본금 (만 원)</label>
                        <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} />
                    </div>
                    <div className="input-group" style={{ margin: 0 }}>
                        <label>목표 상승률 (%) / 하락폭 (%)</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="number" value={upside} onChange={e => setUpside(Number(e.target.value))} placeholder="상승" />
                            <input type="number" value={expectedDrop} onChange={e => setExpectedDrop(Number(e.target.value))} placeholder="하락" />
                        </div>
                    </div>
                    <div className="input-group" style={{ margin: 0 }}>
                        <label>보유 현금 비중 (%)</label>
                        <input type="number" value={cashRatio} onChange={e => setCashRatio(Number(e.target.value))} />
                    </div>
                    <div className="input-group" style={{ margin: 0, marginTop: '10px' }}>
                        <label style={{ color: '#38bdf8' }}>⚠️ 내가 생각하는 하락 확률: {probDrop}%</label>
                        <input type="range" min="0" max="100" value={probDrop} onChange={e => setProbDrop(Number(e.target.value))} style={{ cursor: 'pointer', width: '100%', marginTop: '5px' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', marginTop: '5px' }}>
                            <span>상승 확신(0%)</span>
                            <span>하락 확신(100%)</span>
                        </div>
                    </div>
                </div>

                {/* 우측: 실시간 결과 대시보드 */}
                <div className={`result-main ${isCurPositive ? 'win-b' : 'win-a'}`} style={{ padding: '30px', justifyContent: 'center', height: '100%' }}>
                    <div><div className="vs-badge">REAL-TIME EXPECTANCY</div></div>
                    
                    <div className="risk-title" style={{ marginTop: '5px' }}>현재 세팅의 수학적 기댓값(EV)</div>
                    <div className="alpha-val" style={{ color: isCurPositive ? '#34d399' : '#ef4444', margin: '10px 0 20px 0', fontSize: '42px' }}>
                        {isCurPositive ? '+' : ''}{Math.round(curMetrics.expectedValue).toLocaleString()} <span style={{ fontSize: '20px', fontWeight: 'normal' }}>만원</span>
                    </div>

                    <div className="final-conclusion" style={{ borderColor: isCurPositive ? '#34d399' : '#ef4444', padding: '15px', marginTop: 0 }}>
                        <div className="risk-title" style={{ marginBottom: '8px' }}>의사결정 가이드</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f8fafc' }}>
                            {isCurPositive ? "✅ 현금 보유가 유리함 (Bet)" : "🚨 지금 다 사는 게 유리함 (Fold)"}
                        </div>
                        <div className="risk-desc" style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '10px', lineHeight: '1.5' }}>
                            손익분기 확률 <b>{curMetrics.breakevenProb}%</b> 이상일 때만 현금이 정당화됩니다.<br/>
                            <span style={{ color: '#94a3b8' }}>(총 리스크 대비 보상 배수 = 1 : {curMetrics.rrRatio})</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', borderTop: '3px solid #34d399', textAlign: 'left' }}>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>물타기 성공 (Alpha)</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#34d399', marginTop: '5px' }}>+{Math.round(curMetrics.rewardAlpha).toLocaleString()}만</div>
                        </div>
                        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', borderTop: '3px solid #f59e0b', textAlign: 'left' }}>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>놓친 기회비용 (Drag)</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f59e0b', marginTop: '5px' }}>-{Math.round(curMetrics.riskDrag).toLocaleString()}만</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✨ 2. 하단: 시나리오 보관함 및 테이블 */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* 테이블 헤더 & 저장 입력창 결합 (공간 절약) */}
                <div style={{ background: '#1e293b', padding: '15px 20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>📊 시나리오 보관함 및 일괄 대조</h3>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input 
                            type="text" 
                            value={presetName} 
                            onChange={e => setPresetName(e.target.value)} 
                            placeholder="현재 세팅 이름 지정" 
                            style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white', fontSize: '13px', width: '220px' }} 
                        />
                        <button className="btn btn-save" onClick={saveCurrentScenario} style={{ padding: '10px 15px', fontSize: '13px' }}>+ 하단에 저장</button>
                    </div>
                </div>
                
                {/* 데이터 테이블 */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', minWidth: '900px' }}>
                        <thead>
                            <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                                <th style={{ padding: '15px' }}>케이스명 (조건 세트)</th>
                                <th style={{ padding: '15px', textAlign: 'right', color: '#f59e0b' }}>기회비용 (Drag)</th>
                                <th style={{ padding: '15px', textAlign: 'right', color: '#ef4444' }}>하락 타격 (DD)</th>
                                <th style={{ padding: '15px', textAlign: 'right', color: '#34d399' }}>물타기 알파</th>
                                <th style={{ padding: '15px', textAlign: 'right', color: '#38bdf8' }}>손익분기 확률</th>
                                <th style={{ padding: '15px', textAlign: 'right' }}>최종 기댓값(EV)</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>삭제</th>
                            </tr>
                        </thead>
                        <tbody>
                            {presets.map(p => {
                                const m = calculateMetrics(p);
                                const isPos = m.expectedValue > 0;
                                return (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #1e293b', background: isPos ? 'rgba(52, 211, 153, 0.02)' : 'rgba(239, 68, 68, 0.02)', cursor: 'pointer', transition: '0.2s' }} onClick={() => loadScenario(p)}>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>{p.name}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                현금:{p.cashRatio}% / 상승:{p.upside}% / 하락:{p.expectedDrop}% / 확신:{p.probDrop}%
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'right', color: '#f59e0b', fontWeight: '500' }}>-{Math.round(m.riskDrag).toLocaleString()}만</td>
                                        <td style={{ padding: '15px', textAlign: 'right', color: '#ef4444', fontWeight: '500' }}>-{Math.round(m.riskDrawdown).toLocaleString()}만</td>
                                        <td style={{ padding: '15px', textAlign: 'right', color: '#34d399', fontWeight: '500' }}>+{Math.round(m.rewardAlpha).toLocaleString()}만</td>
                                        <td style={{ padding: '15px', textAlign: 'right', color: '#38bdf8', fontWeight: 'bold' }}>{m.breakevenProb}%</td>
                                        <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: isPos ? '#34d399' : '#ef4444', fontSize: '16px' }}>
                                            {isPos ? '+' : ''}{Math.round(m.expectedValue).toLocaleString()}만
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <button className="btn-delete" onClick={(e) => deleteScenario(p.id, e)}>✕</button>
                                        </td>
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
