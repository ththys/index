// 데이터 로딩 래퍼 (훅 순서를 지키기 위해 화면 본체와 분리)
function StockLookup(props) {
    const { data, error } = useMarketData();
    if (!data) return <div className="fade-in wide-layout"><h2>종목 조회</h2><DataStatus error={error} /></div>;
    return <StockLookupView data={data} {...props} />;
}

function StockLookupView({ data, ticker, setTicker }) {
    const { useState, useMemo } = React;
    const [query, setQuery] = useState('');
    const [range, setRange] = useState('1Y');
    const [view, setView] = useState('price');

    const { market, prices } = data;
    const all = Object.entries(market.tickers).map(([t, v]) => ({ ticker: t, ...v }));
    const current = market.tickers[ticker] ? ticker : (all.find(x => x.group === 'watchlist') || all[0]).ticker;
    const item = market.tickers[current];
    const m = item.metrics;
    const info = item.info || {};

    const q = query.trim().toLowerCase();
    const matches = q ? all.filter(x => x.ticker.toLowerCase().includes(q) || x.name.toLowerCase().includes(q)).slice(0, 8) : [];

    const chart = useMemo(() => {
        const full = prices.close[current] || [];
        const ma60 = movingAvg(full, 60), ma200 = movingAvg(full, 200);
        const i0 = startIndex(prices.dates, range);
        const labels = prices.dates.slice(i0);
        if (view === 'price') {
            return { labels, datasets: [
                { label: '종가', data: full.slice(i0), borderColor: '#38bdf8' },
                { label: 'MA60', data: ma60.slice(i0), borderColor: '#fbbf24', borderWidth: 1 },
                { label: 'MA200', data: ma200.slice(i0), borderColor: '#a855f7', borderWidth: 1 },
            ]};
        }
        return { labels, datasets: [
            { label: 'Drawdown (%)', data: drawdownSeries(full.slice(i0)), borderColor: MK_DOWN,
              backgroundColor: 'rgba(244,63,94,0.15)', fill: true },
        ]};
    }, [current, range, view]);

    const kpis = [
        ['1D', m.d1], ['1M', m.m1], ['YTD', m.ytd], ['1Y', m.y1], ['MDD(1Y)', m.mdd1y], ['고점대비', m.fromHigh],
    ];
    const pct100 = v => (v === null || v === undefined) ? '-' : (v * 100).toFixed(1) + '%';
    const infoRows = [
        ['시가총액', fmtCap(info.marketCap)], ['PER (TTM)', fmtNum(info.per, 1)], ['PER (Fwd)', fmtNum(info.fper, 1)],
        ['PBR', fmtNum(info.pbr, 2)], ['ROE', pct100(info.roe)], ['영업이익률', pct100(info.opm)],
        ['매출성장 (YoY)', pct100(info.revg)], ['배당수익률', info.divy ? info.divy.toFixed(2) + '%' : '-'], ['베타', fmtNum(info.beta, 2)],
    ];

    return (
        <div className="fade-in wide-layout">
            <h2>종목 조회</h2>
            <p className="subtitle">데이터 기준 {market.updated} · 목록에 없는 종목은 config/universe.json 에 추가</p>

            <div className="mk-search">
                <input placeholder="티커 또는 이름 검색 (예: NVDA, 삼성)" value={query} onChange={e => setQuery(e.target.value)} />
                {matches.length > 0 && (
                    <div className="mk-dropdown">
                        {matches.map(x => (
                            <div key={x.ticker} className="mk-dropdown-item" onClick={() => { setTicker(x.ticker); setQuery(''); }}>
                                <b>{x.name}</b> <span className="mk-muted">{x.ticker}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="card">
                <div className="mk-title-row">
                    <div>
                        <div className="mk-name">{item.name} <span className="mk-muted">{current}</span></div>
                        <div className="mk-muted" style={{ fontSize: 12 }}>{info.sector || '-'} / {info.industry || '-'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div className="mk-price">{fmtNum(m.price)} <span style={{ fontSize: 12 }} className="mk-muted">{info.currency || ''}</span></div>
                        <div style={{ color: pctColor(m.d1), fontSize: 13, fontWeight: 700 }}>{fmtPct(m.d1, 2)}</div>
                    </div>
                </div>
                <div className="mk-kpis">
                    {kpis.map(([label, v]) => (
                        <div key={label} className="mk-kpi">
                            <div className="mk-kpi-label">{label}</div>
                            <div className="mk-kpi-value" style={{ color: pctColor(v) }}>{fmtPct(v)}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <div className="mk-toolbar">
                    <div className="mk-seg">
                        <button className={view === 'price' ? 'on' : ''} onClick={() => setView('price')}>가격</button>
                        <button className={view === 'dd' ? 'on' : ''} onClick={() => setView('dd')}>낙폭</button>
                    </div>
                    <div className="mk-seg">
                        {['3M', '6M', 'YTD', '1Y', '3Y'].map(r => (
                            <button key={r} className={range === r ? 'on' : ''} onClick={() => setRange(r)}>{r}</button>
                        ))}
                    </div>
                </div>
                <MkChart labels={chart.labels} datasets={chart.datasets} height={280} />
            </div>

            {item.info && (
                <div className="card">
                    <div className="mk-section-title">기본 지표</div>
                    <div className="mk-info-grid">
                        {infoRows.map(([k, v]) => (
                            <div key={k} className="mk-info-cell"><span className="mk-muted">{k}</span><b>{v}</b></div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
