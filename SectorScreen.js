// 데이터 로딩 래퍼 (훅 순서를 지키기 위해 화면 본체와 분리)
function SectorScreen(props) {
    const { data, error } = useMarketData();
    if (!data) return <div className="fade-in wide-layout"><h2>섹터 스크리닝</h2><DataStatus error={error} /></div>;
    return <SectorScreenView data={data} {...props} />;
}

function SectorScreenView({ data, openStock }) {
    const { useState, useMemo } = React;
    const [uni, setUni] = useState(null);
    const [picked, setPicked] = useState([]);
    const sorter = useSort('rs3m');

    const { market, prices } = data;

    const uniNames = Object.keys(market.sectors);
    const uniName = uni && market.sectors[uni] ? uni : uniNames[0];
    const sec = market.sectors[uniName];
    const sorted = sorter.apply(sec.rows);
    const benchM = market.tickers[sec.bench] ? market.tickers[sec.bench].metrics : {};

    const cols = [
        { key: 'rs3m', label: '상대강도 3M' }, { key: 'rs6m', label: '상대강도 6M' },
        ...MK_PCT_COLS,
    ];
    const sortLabel = (cols.find(c => c.key === sorter.sort.key) || { label: sorter.sort.key }).label;

    const bar = useMemo(() => ({
        labels: sorted.map(r => r.name),
        datasets: [{
            label: sortLabel,
            data: sorted.map(r => r[sorter.sort.key]),
            backgroundColor: sorted.map(r => pctColor(r[sorter.sort.key])),
            borderWidth: 0,
        }],
    }), [uniName, sorter.sort.key, sorter.sort.dir]);

    const lineTickers = picked.length ? picked : sorted.slice(0, 3).map(r => r.ticker);
    const line = useMemo(() => {
        const i0 = startIndex(prices.dates, '1Y');
        const ts = [...lineTickers, sec.bench];
        return {
            labels: prices.dates.slice(i0),
            datasets: ts.map((t, i) => ({
                label: t === sec.bench ? `${sec.benchName} (벤치마크)` : (market.tickers[t] || {}).name || t,
                data: rebaseSeries((prices.close[t] || []).slice(i0)),
                borderColor: t === sec.bench ? '#e2e8f0' : MK_COLORS[i % MK_COLORS.length],
                borderDash: t === sec.bench ? [4, 4] : [],
                spanGaps: true,
            })),
        };
    }, [uniName, lineTickers.join(',')]);

    const togglePick = t => setPicked(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

    return (
        <div className="fade-in wide-layout">
            <h2>섹터 스크리닝</h2>
            <p className="subtitle">상대강도 = 섹터 수익률 − 벤치마크 수익률 (%p). 양수면 시장보다 강한 섹터.</p>

            <div className="mk-toolbar">
                <div className="mk-seg">
                    {uniNames.map(n => (
                        <button key={n} className={n === uniName ? 'on' : ''} onClick={() => { setUni(n); setPicked([]); }}>{n}</button>
                    ))}
                </div>
                <div className="mk-muted" style={{ fontSize: 12 }}>
                    벤치마크 {sec.benchName}: 3M <b style={{ color: pctColor(benchM.m3) }}>{fmtPct(benchM.m3)}</b>
                    {' '}YTD <b style={{ color: pctColor(benchM.ytd) }}>{fmtPct(benchM.ytd)}</b>
                </div>
            </div>

            <div className="card mk-table-wrap">
                <table className="mk-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th className="left" onClick={() => sorter.toggle('name')}>섹터{sorter.arrow('name')}</th>
                            {cols.map(c => (
                                <th key={c.key} onClick={() => sorter.toggle(c.key)}
                                    className={c.key.startsWith('rs') ? 'mk-hl' : ''}>{c.label}{sorter.arrow(c.key)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map(r => (
                            <tr key={r.ticker} className={picked.includes(r.ticker) ? 'picked' : ''}>
                                <td><input type="checkbox" checked={picked.includes(r.ticker)} onChange={() => togglePick(r.ticker)} /></td>
                                <td className="left mk-link" onClick={() => openStock(r.ticker)}>
                                    {r.name} <span className="mk-muted">{r.ticker}</span>
                                </td>
                                {cols.map(c => (
                                    <td key={c.key} className={c.key.startsWith('rs') ? 'mk-hl' : ''}
                                        style={{ color: c.neutral ? '#cbd5e1' : pctColor(r[c.key]) }}>
                                        {c.neutral ? (r[c.key] ? r[c.key].toFixed(1) + '%' : '-')
                                            : c.key.startsWith('rs') ? (r[c.key] === null ? '-' : (r[c.key] > 0 ? '+' : '') + r[c.key].toFixed(1) + 'p')
                                            : fmtPct(r[c.key])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mk-two-col">
                <div className="card">
                    <div className="mk-section-title">{sortLabel} 순위</div>
                    <MkChart type="bar" labels={bar.labels} datasets={bar.datasets} height={Math.max(220, sorted.length * 24)}
                        options={{ indexAxis: 'y', plugins: { legend: { display: false } } }} />
                </div>
                <div className="card">
                    <div className="mk-section-title">
                        섹터 vs 벤치마크 (1Y, 시작=100) {picked.length ? '' : <span className="mk-muted"> · 상위 3개</span>}
                    </div>
                    <MkChart labels={line.labels} datasets={line.datasets} height={Math.max(220, sorted.length * 24)} />
                </div>
            </div>
        </div>
    );
}
