function Calculator() {
    const { useState, useEffect, useRef } = React;
    const COLORS = ['#94a3b8', '#38bdf8', '#34d399', '#f43f5e', '#a855f7', '#fbbf24'];

    const [capital, setCapital] = useState(1000);
    const [marketReturns, setMarketReturns] = useState([-20, 10, 15]);
    const [scenarios, setScenarios] = useState([{ id: 1, label: 'B전략', ratios: [30, 0, 0] }]);
    const [results, setResults] = useState([]);
    const chartRef = useRef(null);
    const canvasRef = useRef(null);

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
        const nextChar = String.fromCharCode(66 + scenarios.length);
        setScenarios([...scenarios, { id: Date.now(), label: `${nextChar}전략`, ratios: Array(marketReturns.length).fill(0) }]);
    };

    const handleCalc = () => {
        const allScens = [{ label: 'A전략 (현금 0%)', ratios: Array(marketReturns.length).fill(0) }, ...scenarios];
        let baseFinal = 0;

        const newResults = allScens.map((scen, idx) => {
            let currentVal = capital;
            let trajectory = [capital];
            marketReturns.forEach((ret, pIdx) => {
                // 비율을 현금 비중으로 명확히 연산
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
                <h2 style={{fontSize: '32px', fontWeight: '800', marginBottom: '10px'}}>시계열 시뮬레이터 📈</h2>
                <p style={{color: '#94a3b8', fontSize: '18px'}}>시간 흐름에 따른 현금 비중 조절이 자산 곡선에 미치는 영향을 분석합니다.</p>
            </div>
            <div className="card">
                <div className="top-settings">
                    <div className="input-group" style={{marginBottom: 0}}>
                        <label>초기 자본금 (만 원)</label>
                        <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} />
                    </div>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button className="btn btn-period" onClick={removePeriod} style={{color:'#ef4444'}}>- 시기 줄이기</button>
                        <button className="btn btn-period" onClick={addPeriod} style={{color:'#38bdf8'}}>+ 시기 늘리기</button>
                    </div>
                </div>

                <div className="scenario-board">
                    <div className="scenario-column market">
                        <div className="scenario-header">📈 시장 수익률(%)</div>
                        {marketReturns.map((ret, pIdx) => (
                            <div className="input-row" key={pIdx}>
                                <span>{pIdx + 1}기</span>
                                <input type="number" value={ret} onChange={e => { const newRets = [...marketReturns]; newRets[pIdx] = Number(e.target.value); setMarketReturns(newRets); }} />
                            </div>
                        ))}
                    </div>
                    <div className="scenario-column" style={{ opacity: 0.6 }}>
                        <div className="scenario-header">A전략 (현금 0%)</div>
                        {marketReturns.map((_, pIdx) => ( <div className="input-row" key={pIdx}><span>{pIdx + 1}기</span><input type="number" disabled value="0" /></div> ))}
                    </div>
                    {scenarios.map((scen, sIdx) => (
                        <div className="scenario-column" key={scen.id}>
                            {/* 명칭을 명확하게 변경 */}
                            <div className="scenario-header" style={{color: '#34d399'}}>{scen.label} 현금(%)</div>
                            {marketReturns.map((_, pIdx) => (
                                <div className="input-row" key={pIdx}>
                                    <span>{pIdx + 1}기</span>
                                    <input type="number" value={scen.ratios[pIdx]} onChange={e => { const newScens = [...scenarios]; newScens[sIdx].ratios[pIdx] = Number(e.target.value); setScenarios(newScens); }} />
                                </div>
                            ))}
                        </div>
                    ))}
                    <button className="btn btn-add-col" onClick={addScenario}>+ 전략 추가</button>
                </div>
                <button className="btn btn-calc" onClick={handleCalc}>시뮬레이션 실행</button>
            </div>
            <div className="chart-container"><canvas ref={canvasRef}></canvas></div>
            <div className="result-grid">
                {results.map((r, i) => (
                    <div key={i} className="res-box" style={{ borderTop: `4px solid ${r.color}` }}>
                        <div style={{fontSize:'14px', color:'#94a3b8', marginBottom:'8px'}}>{r.label}</div>
                        <div style={{fontSize:'22px', fontWeight:'bold'}}>{Math.round(r.finalVal).toLocaleString()} 만원</div>
                        {i > 0 && <div style={{marginTop:'12px', color: r.alpha>=0 ? '#34d399':'#ef4444', fontWeight:'bold', fontSize:'14px'}}>{r.alpha>=0?'▲':'▼'} A대비 {Math.abs(Math.round(r.alpha)).toLocaleString()}만</div>}
                    </div>
                ))}
            </div>
        </div>
    );
}
