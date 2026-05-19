const calcStyles = `
    .calc-layout { display: flex; flex-direction: column; gap: 30px; }
    .card { background-color: #1e293b; padding: 30px; border-radius: 20px; border: 1px solid #334155; }
    .top-settings { display: flex; gap: 15px; align-items: flex-end; margin-bottom: 25px; flex-wrap: wrap; }
    .input-group { flex: 1; min-width: 200px; }
    .input-group label { display: block; margin-bottom: 8px; color: #94a3b8; font-size: 14px; font-weight: bold; }
    .input-group input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #475569; background-color: #0f172a; color: white; font-size: 16px; }

    .scenario-board { display: flex; gap: 15px; overflow-x: auto; padding-bottom: 15px; }
    .scenario-board::-webkit-scrollbar { height: 8px; }
    .scenario-board::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
    
    .scenario-column { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 15px; width: 170px; flex-shrink: 0; display: flex; flex-direction: column; gap: 10px; }
    .scenario-column.market { background: #082f49; border-color: #0284c7; width: 190px; }
    .scenario-header { text-align: center; font-weight: bold; padding-bottom: 12px; border-bottom: 1px solid #1e293b; margin-bottom: 5px; color: #f8fafc; font-size: 15px; }
    .market .scenario-header { color: #38bdf8; border-color: #0369a1; }
    
    .input-row { display: flex; align-items: center; gap: 10px; }
    .input-row span { color: #94a3b8; font-size: 13px; width: 35px; text-align: center; }
    .input-row input { width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #475569; background: #1e293b; color: white; text-align: right; font-size: 15px; }
    .market .input-row input { background: #0c4a6e; border-color: #0ea5e9; font-weight: bold; }
    
    .btn { padding: 12px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; border: none; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
    .btn-period { background: #334155; color: #f8fafc; font-size: 14px; }
    .btn-add-col { background: transparent; color: #94a3b8; border: 1px dashed #475569; width: 120px; flex-shrink: 0; }
    .btn-calc { background: #38bdf8; color: #0b1120; font-size: 16px; width: 100%; padding: 15px; margin-top: 15px; }
    
    .chart-container { background-color: #1e293b; padding: 25px; border-radius: 20px; border: 1px solid #334155; height: 400px; }
    .result-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 15px; margin-top: 10px; }
    .res-box { padding: 20px; border-radius: 16px; border: 1px solid #334155; background: #0f172a; }
`;

const calcStyleEl = document.createElement('style');
calcStyleEl.innerHTML = calcStyles;
document.head.appendChild(calcStyleEl);

function Calculator() {
    const { useState, useEffect, useRef } = React;
    const COLORS = ['#94a3b8', '#38bdf8', '#34d399', '#f43f5e', '#a855f7', '#fbbf24'];

    const [capital, setCapital] = useState(1000);
    const [marketReturns, setMarketReturns] = useState([-20, 10, 15]);
    const [scenarios, setScenarios] = useState([{ id: 1, label: 'B조건', ratios: [30, 0, 0] }]);
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
        setScenarios([...scenarios, { id: Date.now(), label: `${nextChar}조건`, ratios: Array(marketReturns.length).fill(0) }]);
    };

    const handleCalc = () => {
        const allScens = [{ label: 'A조건 (올인)', ratios: Array(marketReturns.length).fill(0) }, ...scenarios];
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
                <p style={{color: '#94a3b8', fontSize: '18px'}}>시간 흐름에 따른 비중 조절이 자산 곡선에 미치는 영향을 분석합니다.</p>
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
                        <div className="scenario-header">A조건 (기본)</div>
                        {marketReturns.map((_, pIdx) => ( <div className="input-row" key={pIdx}><span>{pIdx + 1}기</span><input type="number" disabled value="0" /></div> ))}
                    </div>
                    {scenarios.map((scen, sIdx) => (
                        <div className="scenario-column" key={scen.id}>
                            <div className="scenario-header">{scen.label} 비중(%)</div>
                            {marketReturns.map((_, pIdx) => (
                                <div className="input-row" key={pIdx}>
                                    <span>{pIdx + 1}기</span>
                                    <input type="number" value={scen.ratios[pIdx]} onChange={e => { const newScens = [...scenarios]; newScens[sIdx].ratios[pIdx] = Number(e.target.value); setScenarios(newScens); }} />
                                </div>
                            ))}
                        </div>
                    ))}
                    <button className="btn btn-add-col" onClick={addScenario}>+ 조건 추가</button>
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
