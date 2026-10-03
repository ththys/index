// 데이터 로딩 래퍼 (훅 순서를 지키기 위해 화면 본체와 분리)
function MultiChange(props) {
    const { data, error } = useMarketData();
    if (!data) return <div className="fade-in wide-layout"><h2>다중 변화량</h2><DataStatus error={error} /></div>;
    return <MultiChangeView data={data} {...props} />;
}

function MultiChangeView({ data, openStock }) {
    const { useState, useMemo } = React;
    const [group, setGroup] = useState('watchlist');
    const [filter, setFilter] = useState('');
    const [picked, setPicked] = useState([]);
    const [range, setRange] = useState('YTD');
    const sorter = useSort('ytd');

    const { market, prices } = data;

    const groups = { watchlist: '관심종목', benchmark: '벤치마크', sector: '섹터 ETF', all: '전체' };
    const q = filter.trim().toLowerCase();
    const rows = Object.entries(market.tickers)
        .filter(([t, v]) => group === 'all' || v.group === group)
        .filter(([t, v]) => !q || t.toLowerCase().includes(q) || v.name.toLowerCase().includes(q))
        .map(([t, v]) => ({ ticker: t, name: v.name, ...v.metrics }));
    const sorted = sorter.apply(rows);

    // 체크 안 했으면 정렬 상위 5개를 차트에
    const chartTickers = picked.length ? picked : sorted.slice(0, 5).map(r => r.ticker);
    const chart = useMemo(() => {
        const i0 = startIndex(prices.dates, range);
        return {
            labels: prices.dates.slice(i0),
            datasets: chartTickers.map((t, i) => ({
                label: market.tickers[t] ? market.tickers[t].name : t,
                data: rebaseSeries((prices.close[t] || []).slice(i0)),
                borderColor: MK_COLORS[i % MK_COLORS.length], spanGaps: true,
            })),
        };
    }, [chartTickers.join(','), range]);

    const togglePick = t => setPicked(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

    return (
        <div className="fade-in wide-layout">
            <h2>다중 변화량</h2>
            <p className="subtitle">기간별 수익률, MDD, 고점대비 낙폭을 한 표에서 비교합니다. 헤더를 누르면 정렬, 행 이름을 누르면 종목 조회로 이동.</p>

            <div className="mk-toolbar">
                <div className="mk-seg">
                    {Object.entries(groups).map(([k, label]) => (
                        <button key={k} className={group === k ? 'on' : ''} onClick={() => setGroup(k)}>{label}</button>
                    ))}
                </div>
                <input className="mk-filter" placeholder="필터" value={filter} onChange={e => setFilter(e.target.value)} />
            </div>

            <div className="card mk-table-wrap">
                <table className="mk-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th className="left" onClick={() => sorter.toggle('name')}>종목{sorter.arrow('name')}</th>
                            <th onClick={() => sorter.toggle('price')}>현재가{sorter.arrow('price')}</th>
                            {MK_PCT_COLS.map(c => (
                                <th key={c.key} onClick={() => sorter.toggle(c.key)}>{c.label}{sorter.arrow(c.key)}</th>
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
                                <td>{fmtNum(r.price)}</td>
                                {MK_PCT_COLS.map(c => (
                                    <td key={c.key} style={{ color: c.neutral ? '#cbd5e1' : pctColor(r[c.key]) }}>
                                        {c.neutral ? (r[c.key] ? r[c.key].toFixed(1) + '%' : '-') : fmtPct(r[c.key])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <div className="mk-toolbar">
                    <div className="mk-section-title" style={{ margin: 0 }}>
                        누적 수익률 (시작=100) {picked.length ? '' : <span className="mk-muted"> · 체크한 종목이 없어 상위 5개 표시</span>}
                    </div>
                    <div className="mk-seg">
                        {['1M', '3M', '6M', 'YTD', '1Y', '3Y'].map(r => (
                            <button key={r} className={range === r ? 'on' : ''} onClick={() => setRange(r)}>{r}</button>
                        ))}
                    </div>
                </div>
                <MkChart labels={chart.labels} datasets={chart.datasets} height={300} />
            </div>
        </div>
    );
}
