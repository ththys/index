const breakStyles = `
    .break-layout { display: grid; grid-template-columns: 380px 1fr; gap: 30px; }
    .card { background-color: #1e293b; padding: 30px; border-radius: 20px; border: 1px solid #334155; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); }
    .input-group { margin-bottom: 25px; }
    .input-group label { display: block; margin-bottom: 10px; color: #94a3b8; font-size: 14px; font-weight: bold; }
    .input-group input { width: 100%; padding: 15px; border-radius: 12px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 18px; transition: 0.2s; }
    .input-group input:focus { border-color: #38bdf8; outline: none; }
    
    .vs-badge { background: #334155; padding: 6px 16px; border-radius: 20px; font-size: 12px; color: #38bdf8; display: inline-block; margin-bottom: 15px; font-weight: bold; letter-spacing: 1px; }
    
    .result-main { background: #0f172a; border-radius: 24px; padding: 40px; text-align: center; display: flex; flex-direction: column; justify-content: center; border: 2px solid transparent; transition: 0.3s; }
    .win-b { border-color: #34d399; background: rgba(52, 211, 153, 0.05); }
    .win-a { border-color: #ef4444; background: rgba(239, 68, 68, 0.05); }

    .alpha-val { font-size: 56px; font-weight: 800; margin: 20px 0; }
    .conclusion { font-size: 18px; line-height: 1.6; color: #e2e8f0; background: #1e293b; padding: 20px; border-radius: 16px; }
    .compare-grid { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .compare-box { text-align: left; padding: 20px; background: #1e293b; border-radius: 16px; border: 1px solid #334155; }
`;

const breakStyleEl = document.createElement('style');
breakStyleEl.innerHTML = breakStyles;
document.head.appendChild(breakStyleEl);

function Breakeven() {
    const { useState } = React;
    const [capital, setCapital] = useState(1000);
    const [upside, setUpside] = useState(10);
    const [cashRatio, setCashRatio] = useState(30);
    const [expectedDrop, setExpectedDrop] = useState(15);

    // 1. A전략: 즉시 상승 시
    const finalA = capital * (1 + (upside / 100));

    // 2. B전략: 하락 후 물타기 후 반등 시
    const stockPortion = capital * (1 - (cashRatio / 100));
    const cashPortion = capital * (cashRatio / 100);
    const droppedStockVal = stockPortion * (1 - (expectedDrop / 100));
    const recoveredVal = (droppedStockVal + cashPortion) / (1 - (expectedDrop / 100));
    const finalB = recoveredVal * (1 + (upside / 100));

    const alpha = finalB - finalA;
    const isBWinning = alpha > 0;

    return (
        <div className="fade-in">
            <h2 style={{fontSize: '32px', fontWeight: '800', marginBottom: '10px'}}>기회비용 vs 물타기 분석 ⚖️</h2>
            <p style={{color: '#94a3b8', fontSize: '18px', marginBottom: '30px'}}>현금을 들고 하락을 기다릴 때의 손익분기점을 확인하세요.</p>

            <div className="break-layout">
                <div className="card">
                    <div className="input-group">
                        <label>초기 자본금 (만 원)</label>
                        <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} />
                    </div>
                    <div className="input-group">
                        <label>목표 상승률 (%) <span style={{fontWeight:'normal', fontSize:'12px', color:'#475569'}}>(그대로 오를 때)</span></label>
                        <input type="number" value={upside} onChange={e => setUpside(Number(e.target.value))} />
                    </div>
                    <div className="input-group">
                        <label>보유 현금 비중 (%)</label>
                        <input type="number" value={cashRatio} onChange={e => setCashRatio(Number(e.target.value))} />
                    </div>
                    <div className="input-group" style={{marginBottom: 0}}>
                        <label>기다리는 하락폭 (%) <span style={{fontWeight:'normal', fontSize:'12px', color:'#475569'}}>(바닥 지점)</span></label>
                        <input type="number" value={expectedDrop} onChange={e => setExpectedDrop(Number(e.target.value))} />
                    </div>
                </div>

                <div className={`result-main ${isBWinning ? 'win-b' : 'win-a'}`}>
                    <div><div className="vs-badge">STRATEGY COMPARISON</div></div>
                    <div style={{color: '#94a3b8', fontSize: '16px'}}>현금 보유 전략의 최종 초과 수익(Alpha)</div>
                    
                    <div className="alpha-val" style={{color: isBWinning ? '#34d399' : '#ef4444'}}>
                        {isBWinning ? '+' : ''}{Math.round(alpha).toLocaleString()} <span style={{fontSize:'24px', fontWeight:'normal'}}>만원</span>
                    </div>
                    
                    <div className="conclusion">
                        {isBWinning ? (
                            <span>🔥 <b>현금 대기가 유리합니다!</b><br/>시장 상승분({upside}%)을 놓치는 기회비용보다, <b>-{expectedDrop}% 하락 시 물타기로 얻는 이득</b>이 더 큽니다.</span>
                        ) : (
                            <span>⚠️ <b>지금 바로 매수하는 게 낫습니다.</b><br/>현금을 들고 하락을 기다리는 손해가 더 큽니다. 알파를 얻으려면 <b>하락폭(-%)이 더 깊거나 현금 비중이 커야</b> 합니다.</span>
                        )}
                    </div>

                    <div className="compare-grid">
                        <div className="compare-box">
                            <div style={{fontSize:'13px', color:'#94a3b8', marginBottom:'5px'}}>A. 0% 현금 (즉시 상승)</div>
                            <div style={{fontSize:'22px', fontWeight:'bold'}}>{Math.round(finalA).toLocaleString()} 만원</div>
                        </div>
                        <div className="compare-box">
                            <div style={{fontSize:'13px', color:'#94a3b8', marginBottom:'5px'}}>B. {cashRatio}% 현금 (하락 후 반등)</div>
                            <div style={{fontSize:'22px', fontWeight:'bold', color: isBWinning ? '#34d399' : '#f8fafc'}}>{Math.round(finalB).toLocaleString()} 만원</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
