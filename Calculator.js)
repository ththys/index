// 계산기 화면 전용 스타일 정의
const calcStyles = `
    .calc-layout { display: grid; grid-template-columns: 400px 1fr; gap: 30px; }
    .card { background-color: #1e293b; padding: 25px; border-radius: 16px; border: 1px solid #334155; }
    .input-group { margin-bottom: 15px; }
    .input-group label { display: block; margin-bottom: 6px; color: #94a3b8; font-size: 13px; }
    .input-group input { width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #475569; background-color: #0f172a; color: white; font-size: 14px; }
    .grid-row { display: grid; grid-template-columns: 60px repeat(auto-fit, minmax(60px, 1fr)); gap: 10px; align-items: center; margin-bottom: 10px; }
    .grid-row input { text-align: center; }
    
    .btn { width: 100%; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold; border: none; font-size: 14px; transition: 0.2s; }
    .btn-add { background: transparent; border: 1px dashed #475569; color: #94a3b8; margin-bottom: 10px; }
    .btn-add:hover { border-color: #38bdf8; color: #38bdf8; }
    .btn-calc { background: #38bdf8; color: #0b1120; font-size: 16px; padding: 15px; margin-top: 10px; }
    .btn-calc:hover { background: #7dd3fc; }
    
    .display-area { display: flex; flex-direction: column; gap: 30px; }
    .chart-container { background-color: #1e293b; padding: 25px; border-radius: 16px; border: 1px solid #334155; height: 350px; position: relative; }
    .result-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 15px; }
    .res-box { padding: 20px; border-radius: 12px; border: 1px solid #334155; background: #0f172a; }
    .res-box.best { border-color: #38bdf8; background: rgba(56, 189, 248, 0.05); }
    .res-box.worst { border-color: #ef4444; background: rgba(239, 68, 68, 0.05); }
    .alpha-tag { margin-top: 10px; padding-top: 10px; border-top: 1px solid #334155; font-size: 14px; font-weight: bold; }
`;

const calcStyleEl = document.createElement('style');
calcStyleEl.innerHTML = calcStyles;
document.head.appendChild(calcStyleEl);

// 계산기 컴포넌트 본체
function Calculator() {
    const { useState, useEffect, useRef } = React;
    const COLORS = ['#94a3b8', '#38bdf8', '#34d399', '#f43f5e', '#a855f7'];

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
        const newId = scenarios.length > 0 ? Math.max(...scenarios.map(s => s.id)) + 1 : 1;
        const nextLabel = String.fromCharCode(66 + scenarios.length);
        setScenarios([...scenarios, { id: newId, label: `${nextLabel}조건`, ratios: Array(marketReturns.length).fill(0) }]);
    };

    const handleCalc = () => {
        const baseScenario = { label: 'A조건 (항상 0%)', ratios: Array(marketReturns.length).fill(0) };
        const allScenarios = [baseScenario, ...scenarios];
        let baseFinalVal = 0;

        const newResults = allScenarios.map((scen, index) => {
            let currentVal = capital;
            let trajectory = [capital]; 
            marketReturns.forEach((marketRet, pIdx) => {
                const ratio = (scen.ratios[pIdx] || 0) / 100; 
                let invested = currentVal * (1 - ratio);
                let cash = currentVal * ratio;
                invested = invested * (1 + (marketRet / 100));
                currentVal = invested + cash;
                trajectory.push(currentVal);
            });
            if (index === 0) baseFinalVal = currentVal;
            return { label: scen.label, trajectory, finalVal: currentVal, alpha: currentVal - baseFinalVal, color: COLORS[index % COLORS.length] };
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
                datasets: results.map(r => ({
                    label: r.label, data: r.trajectory, borderColor: r.color, backgroundColor: r.color, borderWidth: 2, pointRadius: 4, tension: 0.1
                }))
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } }, x: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } } }, plugins: { legend: { labels: { color: '#f8fafc' } } } }
        });
    }, [results]);

    return (
        <div>
            <h2 style={{removeAttribute: '20px', marginBottom: '20px'}}>A. 시계열 현금비중 시뮬레이터</h2>
            <div className="calc-layout">
                <div className="card" style={{ height: 'fit-content' }}>
                    <div className="input-group">
                        <label>초기 자본금 (만 원)</label>
                        <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} />
                    </div>
                    <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                            <span style={{color: '#94a3b8', fontSize: '14px', fontWeight: 'bold'}}>📈 시기별 시장 수익률 (%)</span>
                            <div><button onClick={removePeriod} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer', marginRight:'10px'}}>-</button> <button onClick={addPeriod} style={{background:'none', border:'none', color:'#38bdf8', cursor:'pointer'}}>+</button></div>
                        </div>
                        <div className="grid-row">
                            <span style={{color: '#475569', fontSize: '12px'}}>시장</span>
                            {marketReturns.map((ret, idx) => (
                                <div key={idx}><div style={{fontSize:'11px', color:'#94a3b8', textAlign:'center'}}>{idx+1}기</div><input type="number" value={ret} onChange={e => { const newRets = [...marketReturns]; newRets[idx] = Number(e.target.value); setMarketReturns(newRets); }} /></div>
                            ))}
                        </div>
                    </div>
                    <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                        <div style={{color: '#94a3b8', fontSize: '14px', fontWeight: 'bold', marginBottom: '15px'}}>💰 시기별 현금 비중 (%)</div>
                        <div className="grid-row" style={{opacity: 0.5}}><span style={{color: '#f8fafc', fontSize: '13px', fontWeight: 'bold'}}>A (기본)</span>{marketReturns.map((_, i) => <input key={i} disabled value="0" style={{background:'transparent', border:'1px solid #334155'}}/>)}</div>
                        {scenarios.map((scen, sIdx) => (
                            <div className="grid-row" key={scen.id}>
                                <span style={{color: '#38bdf8', fontSize: '13px', fontWeight: 'bold'}}>{scen.label}</span>
                                {marketReturns.map((_, pIdx) => <input type="number" key={pIdx} value={scen.ratios[pIdx]} onChange={e => { const newScens = [...scenarios]; newScens[sIdx].ratios[pIdx] = Number(e.target.value); setScenarios(newScens); }} />)}
                            </div>
                        ))}
                        <button className="btn btn-add" onClick={addScenario}>+ 대조군 추가</button>
                    </div>
                    <button className="btn btn-calc" onClick={handleCalc}>계산 및 업데이트</button>
                </div>
                <div className="display-area">
                    <div className="chart-container"><canvas ref={canvasRef}></canvas>{results.length === 0 && <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', color:'#475569'}}>계산 버튼을 누르세요.</div>}</div>
                    <div className="result-grid">
                        {results.map((r, i) => (
                            <div key={i} className={`res-box ${i === 0 ? '' : (r.alpha >= 0 ? 'best' : 'worst')}`} style={{ borderTop: `4px solid ${r.color}` }}>
                                <div style={{fontSize:'15px', fontWeight:'bold', marginBottom:'10px'}}>{r.label}</div>
                                <div style={{fontSize:'18px', fontWeight:'bold'}}>{Math.round(r.finalVal).toLocaleString()} 만 원</div>
                                <div style={{fontSize:'13px', color:'#94a3b8'}}>수익: {(r.finalVal / capital).toFixed(2)}배</div>
                                {i > 0 && <div className="alpha-tag" style={{color: r.alpha >= 0 ? '#34d399' : '#ef4444'}}>{r.alpha >= 0 ? '▲' : '▼'} A대비 {Math.abs(Math.round(r.alpha)).toLocaleString()}만 원</div>}
                                {i === 0 && <div className="alpha-tag" style={{color: '#475569'}}>기준 (올인)</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
