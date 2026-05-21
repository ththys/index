function Calculator() {
    const { useState, useEffect, useRef } = React;
    const COLORS = ['#94a3b8', '#38bdf8', '#34d399', '#f43f5e', '#a855f7', '#fbbf24'];

    // 1. 기본 시뮬레이션 상태 변수들
    const [capital, setCapital] = useState(1000);
    const [marketReturns, setMarketReturns] = useState([-20, 10, 15]);
    const [scenarios, setScenarios] = useState([{ id: 1, label: 'B전략', ratios: [30, 0, 0] }]);
    const [results, setResults] = useState([]);
    
    // 2. 시나리오 저장/보관함용 상태 변수들 (로컬 스토리지 연동)
    const [presetName, setPresetName] = useState('');
    const [presets, setPresets] = useState(() => {
        const saved = localStorage.getItem('finance_calc_presets');
        return saved ? JSON.parse(saved) : [
            // 초기에 참고할 수 있는 3개년 예시 시나리오 기본 제공
            { id: 1, name: '금융위기 후 반등 마스터', capital: 1000, marketReturns: [-30, 20, 15], scenarios: [{ id: 1, label: 'B전략', ratios: [50, 10, 0] }] },
            { id: 2, name: '지루한 박스피 횡보장', capital: 1000, marketReturns: [2, -3, 4], scenarios: [{ id: 1, label: 'B전략', ratios: [20, 20, 20] }] }
        ];
    });

    const chartRef = useRef(null);
    const canvasRef = useRef(null);

    // --- 🛠️ 테이블 구조 제어 함수들 (우측 확장형) ---
    const addPeriod = () => {
        setMarketReturns([...marketReturns, 0]);
        setScenarios(scenarios.map(s => ({ ...s, ratios: [...s.ratios, 0] })));
    };
    const removePeriod = () => {
        if (marketReturns.length <= 1) return;
        setMarketReturns(marketReturns.slice(0, -1));
        setScenarios(scenarios.map(s => ({ ...s, ratios: s.ratios.slice(0, -1) })));
    };
    const addScenario = () => {
        const nextChar = String.fromCharCode(66 + scenarios.length); // B, C, D... 순으로 이름 생성
        setScenarios([...scenarios, { id: Date.now(), label: `${nextChar}전략`, ratios: Array(marketReturns.length).fill(0) }]);
    };
    const removeScenario = (id) => {
        if (scenarios.length <= 1) return;
        setScenarios(scenarios.filter(s => s.id !== id));
    };

    // --- 💾 시나리오 보관함 연동 함수들 ---
    const saveCurrentPreset = () => {
        if (!presetName.trim()) { alert('시나리오 이름을 입력해주세요!'); return; }
        const newPreset = {
            id: Date.now(),
            name: presetName,
            capital,
            marketReturns,
            scenarios
        };
        const updated = [...presets, newPreset];
        setPresets(updated);
        localStorage.setItem('finance_calc_presets', JSON.stringify(updated));
        setPresetName('');
    };

    const deletePreset = (id, e) => {
        e.stopPropagation();
        const updated = presets.filter(p => p.id !== id);
        setPresets(updated);
        localStorage.setItem('finance_calc_presets', JSON.stringify(updated));
    };

    const loadPreset = (p) => {
        setCapital(p.capital);
        setMarketReturns(p.marketReturns);
        setScenarios(p.scenarios);
    };

    // --- 🧮 복리 및 자산 곡선 연산 로직 ---
    const handleCalc = () => {
        // 기준점이 되는 A전략(현금 0%)을 배열 맨 앞에 임시로 결합
        const allScens = [{ label: 'A전략 (현금 0%)', ratios: Array(marketReturns.length).fill(0) }, ...scenarios];
        let baseFinal = 0;

        const newResults = allScens.map((scen, idx) => {
            let currentVal = capital;
            let trajectory = [capital];
            marketReturns.forEach((ret, pIdx) => {
                const r = (scen.ratios[pIdx] || 0) / 100;
                let invested = currentVal * (1 - r);
                let cash = currentVal * r;
                invested *= (1 + (ret / 100));
                currentVal = invested + cash;
                trajectory.push(currentVal);
            });
            if (idx === 0) baseFinal = currentVal;
            return { label: scen.label, trajectory, finalVal: currentVal, alpha: currentVal - baseFinal, color: COLORS[idx % COLORS.length] };
        });
        setResults(newResults);
    };

    // --- 📊 차트 그리기 효과 ---
    useEffect(() => {
        if (results.length === 0) return;
        const ctx = canvasRef.current.getContext('2d');
        if (chartRef.current) chartRef.current.destroy();
        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['시작', ...marketReturns.map((_, i) => `${i + 1}기`)],
                datasets: results.map(r => ({ label: r.label, data: r.trajectory, borderColor: r.color, backgroundColor: r.color, tension: 0.1, borderWidth: 3 }))
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }, x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } } }, plugins: { legend: { labels: { color: '#f8fafc' } } } }
        });
    }, [results]);

    return (
        <div className="fade-in calc-layout">
            <div>
                <h2>시계열 다중 시뮬레이터 📈</h2>
                <p className="subtitle">시기별 시장 수익률과 전략 케이스를 확장하여 복리 효과를 추적합니다.</p>
            </div>

            {/* 상단 레이아웃 (설정 및 시나리오 보관함) */}
            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '30px' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="input-group" style={{ margin: 0 }}>
                        <label>초기 자본금 (만 원)</label>
                        <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-period" onClick={removePeriod} style={{ color: '#ef4444', flex: 1 }}>- 시기 축소</button>
                        <button className="btn btn-period" onClick={addPeriod} style={{ color: '#38bdf8', flex: 1 }}>+ 시기 확장 (우측)</button>
                    </div>
                </div>

                <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <span className="scenario-header">💾 시뮬레이터 시나리오 보관함</span>
                    <div className="scenario-input-row" style={{ margin: 0 }}>
                        <input type="text" className="scenario-input" value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="현재 테이블 세팅 저장 이름 입력" />
                        <button className="btn btn-save" onClick={saveCurrentPreset}>현재 세팅 통째로 저장</button>
                    </div>
                    <div className="scenario-list" style={{ marginTop: '10px', maxHeight: '90px' }}>
                        {presets.map(p => (
                            <div key={p.id} className="scenario-item" onClick={() => loadPreset(p)} style={{ padding: '8px 12px' }}>
                                <span style={{ fontSize: '13px' }}>{p.name}</span>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', color: '#475569' }}>{p.marketReturns.length}개 시기 운용</span>
                                    <button className="btn-delete" onClick={(e) => deletePreset(p.id, e)}>✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ✨ 요청 사항 반영: 시기는 우측(가로) 확장, 케이스는 하단(세로) 확장 테이블 */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: '10px' }}>
                <div style={{ overflowX: 'auto', background: '#0f172a' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: `${250 + (marketReturns.length * 120)}px` }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #334155', background: '#1e293b' }}>
                                <th style={{ padding: '15px', color: '#94a3b8', width: '220px' }}>구분 (전략 케이스)</th>
                                {marketReturns.map((_, pIdx) => (
                                    <th key={pIdx} style={{ padding: '15px', color: '#f8fafc', width: '120px', textAlign: 'center' }}>{pIdx + 1}기</th>
                                ))}
                                <th style={{ padding: '15px', width: '80px', textAlign: 'center' }}>액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* 1열 상설고정: 시장 수익률 행 */}
                            <tr style={{ borderBottom: '1px solid #334155', background: 'rgba(56, 189, 248, 0.02)' }}>
                                <td style={{ padding: '15px', fontWeight: 'bold', color: '#38bdf8' }}>📈 시장 수익률 (%)</td>
                                {marketReturns.map((ret, pIdx) => (
                                    <td key={pIdx} style={{ padding: '10px' }}>
                                        <input type="number" value={ret} onChange={e => { const newRets = [...marketReturns]; newRets[pIdx] = Number(e.target.value); setMarketReturns(newRets); }} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #0ea5e9', background: '#0c4a6e', color: 'white', textAlign: 'center', fontWeight: 'bold' }} />
                                    </td>
                                ))}
                                <td></td>
                            </tr>
                            {/* 2열 상설고정: A전략 (현금 0% 벤치마크) */}
                            <tr style={{ borderBottom: '1px solid #1e293b', opacity: 0.5 }}>
                                <td style={{ padding: '15px', color: '#94a3b8' }}>A전략 (기준선: 현금 0%)</td>
                                {marketReturns.map((_, pIdx) => (
                                    <td key={pIdx} style={{ padding: '10px' }}><input type="number" disabled value="0" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#1e293b', color: '#94a3b8', textAlign: 'center' }} /></td>
                                ))}
                                <td></td>
                            </tr>
                            {/* 하단(세로)으로 동적 추가되는 현금 비중 케이스들 */}
                            {scenarios.map((scen, sIdx) => (
                                <tr key={scen.id} style={{ borderBottom: '1px solid #1e293b' }}>
                                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#34d399' }}>⚙️ {scen.label} 현금 보유 (%)</td>
                                    {marketReturns.map((_, pIdx) => (
                                        <td key={pIdx} style={{ padding: '10px' }}>
                                            <input type="number" value={scen.ratios[pIdx] || 0} onChange={e => { const newScens = [...scenarios]; newScens[sIdx].ratios[pIdx] = Number(e.target.value); setScenarios(newScens); }} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#1e293b', color: 'white', textAlign: 'center' }} />
                                        </td>
                                    ))}
                                    <td style={{ textAlign: 'center' }}>
                                        <button className="btn-delete" onClick={() => removeScenario(scen.id)} style={{ padding: '5px' }}>✕</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ background: '#1e293b', padding: '12px', textAlign: 'left' }}>
                    <button className="btn" onClick={addScenario} style={{ background: 'transparent', border: '1px dashed #475569', color: '#94a3b8', fontSize: '13px', padding: '6px 12px' }}>+ 하단에 비교할 전략 케이스 추가</button>
                </div>
            </div>

            <button className="btn btn-calc" onClick={handleCalc} style={{ margin: '10px 0 20px 0' }}>복리 시뮬레이션 가동</button>

            {/* 시뮬레이션 결과 리포트 보드 */}
            <div className="chart-container"><canvas ref={canvasRef}></canvas></div>
            <div className="result-grid">
                {results.map((r, i) => (
                    <div key={i} className="res-box" style={{ borderTop: `4px solid ${r.color}` }}>
                        <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>{r.label} 최종 금액</div>
                        <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{Math.round(r.finalVal).toLocaleString()} 만원</div>
                        {i > 0 && <div style={{ marginTop: '12px', color: r.alpha >= 0 ? '#34d399' : '#ef4444', fontWeight: 'bold', fontSize: '14px' }}>{r.alpha >= 0 ? '▲' : '▼'} A대비 {Math.abs(Math.round(r.alpha)).toLocaleString()}만</div>}
                    </div>
                ))}
            </div>
        </div>
    );
}
