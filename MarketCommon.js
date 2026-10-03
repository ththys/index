// 시장 데이터 공통 모듈: data/*.json 로딩, 포맷, 차트 래퍼
// (data/*.json 은 scripts/build_data.py 가 GitHub Actions로 매일 갱신)

const MarketData = (function () {
    let cache = null;
    function bust() { return '?v=' + Math.floor(Date.now() / 3600000); } // 1시간 단위 캐시
    function load() {
        if (!cache) {
            cache = Promise.all([
                fetch('data/market.json' + bust()).then(r => { if (!r.ok) throw new Error('market.json ' + r.status); return r.json(); }),
                fetch('data/prices.json' + bust()).then(r => { if (!r.ok) throw new Error('prices.json ' + r.status); return r.json(); }),
            ]).then(([market, prices]) => ({ market, prices }))
              .catch(e => { cache = null; throw e; });
        }
        return cache;
    }
    return { load };
})();

function useMarketData() {
    const { useState, useEffect } = React;
    const [state, setState] = useState({ data: null, error: null });
    useEffect(() => {
        MarketData.load().then(d => setState({ data: d, error: null }))
                         .catch(e => setState({ data: null, error: e.message }));
    }, []);
    return state;
}

// 상승/하락 색 (한국식으로 바꾸려면 두 값만 교체)
const MK_UP = '#34d399';
const MK_DOWN = '#f43f5e';
const MK_COLORS = ['#38bdf8', '#34d399', '#fbbf24', '#a855f7', '#f43f5e', '#94a3b8', '#f97316', '#14b8a6', '#e879f9', '#84cc16'];

function fmtPct(v, digits = 1) {
    if (v === null || v === undefined || isNaN(v)) return '-';
    return (v > 0 ? '+' : '') + v.toFixed(digits) + '%';
}
function pctColor(v) {
    if (v === null || v === undefined || isNaN(v)) return '#64748b';
    return v > 0 ? MK_UP : v < 0 ? MK_DOWN : '#94a3b8';
}
function fmtNum(v, digits = 2) {
    if (v === null || v === undefined || isNaN(v)) return '-';
    return Number(v).toLocaleString('ko-KR', { maximumFractionDigits: digits });
}
function fmtCap(v) {
    if (!v) return '-';
    if (v >= 1e12) return (v / 1e12).toFixed(2) + 'T';
    if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B';
    return (v / 1e6).toFixed(0) + 'M';
}

// 시계열 유틸
function startIndex(dates, key) {
    if (key === 'MAX') return 0;
    const last = new Date(dates[dates.length - 1]);
    let d = new Date(last);
    if (key === 'YTD') d = new Date(last.getFullYear(), 0, 1);
    else if (key === '1M') d.setMonth(d.getMonth() - 1);
    else if (key === '3M') d.setMonth(d.getMonth() - 3);
    else if (key === '6M') d.setMonth(d.getMonth() - 6);
    else if (key === '1Y') d.setFullYear(d.getFullYear() - 1);
    else if (key === '3Y') d.setFullYear(d.getFullYear() - 3);
    const iso = d.toISOString().slice(0, 10);
    const i = dates.findIndex(x => x >= iso);
    return i < 0 ? 0 : i;
}
function rebaseSeries(arr) {
    const base = arr.find(v => v !== null && v !== undefined);
    if (!base) return arr.map(() => null);
    return arr.map(v => (v === null || v === undefined) ? null : v / base * 100);
}
function movingAvg(arr, n) {
    const out = []; let sum = 0, cnt = 0; const q = [];
    for (const v of arr) {
        q.push(v); if (v !== null) { sum += v; cnt++; }
        if (q.length > n) { const r = q.shift(); if (r !== null) { sum -= r; cnt--; } }
        out.push(q.length === n && cnt === n ? sum / n : null);
    }
    return out;
}
function drawdownSeries(arr) {
    let peak = -Infinity;
    return arr.map(v => { if (v === null) return null; peak = Math.max(peak, v); return (v / peak - 1) * 100; });
}

// Chart.js 래퍼: type, labels, datasets, options 가 바뀌면 다시 그림
function MkChart({ type = 'line', labels, datasets, options = {}, height = 260 }) {
    const { useRef, useEffect } = React;
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    useEffect(() => {
        if (chartRef.current) chartRef.current.destroy();
        chartRef.current = new Chart(canvasRef.current, {
            type,
            data: { labels, datasets },
            options: Object.assign({
                responsive: true, maintainAspectRatio: false, animation: false,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { labels: { color: '#94a3b8', boxWidth: 12, font: { size: 11 } } } },
                elements: { point: { radius: 0 }, line: { borderWidth: 1.5 } },
                scales: {
                    x: { ticks: { color: '#64748b', maxTicksLimit: 8, font: { size: 10 } }, grid: { color: '#1e293b' } },
                    y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#1e293b' } },
                },
            }, options),
        });
        return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
    }, [type, labels, datasets, JSON.stringify(options)]);
    return <div className="chart-box" style={{ height }}><canvas ref={canvasRef}></canvas></div>;
}

function DataStatus({ error }) {
    if (error) return (
        <div className="card mk-empty">
            데이터를 불러오지 못했습니다 ({error}).<br />
            <span className="mk-muted">data/market.json 이 아직 없으면 GitHub Actions 탭에서 update-market-data 를 한 번 실행하세요.
            로컬에서는 <code>python -m http.server</code> 로 열어야 합니다.</span>
        </div>
    );
    return <div className="card mk-empty mk-muted">데이터 불러오는 중...</div>;
}

// 정렬 가능한 표 헤더용 훅
function useSort(defaultKey, defaultDir = 'desc') {
    const { useState } = React;
    const [sort, setSort] = useState({ key: defaultKey, dir: defaultDir });
    const toggle = key => setSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }));
    const apply = rows => [...rows].sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key];
        if (av === null || av === undefined) return 1;
        if (bv === null || bv === undefined) return -1;
        const c = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
        return sort.dir === 'desc' ? -c : c;
    });
    const arrow = key => sort.key === key ? (sort.dir === 'desc' ? ' ▼' : ' ▲') : '';
    return { sort, toggle, apply, arrow };
}

// 변화량 표 컬럼 정의 (다중 변화량 / 섹터 공통)
const MK_PCT_COLS = [
    { key: 'd1', label: '1D' }, { key: 'w1', label: '1W' }, { key: 'm1', label: '1M' },
    { key: 'm3', label: '3M' }, { key: 'm6', label: '6M' }, { key: 'y1', label: '1Y' },
    { key: 'ytd', label: 'YTD' }, { key: 'mdd1y', label: 'MDD(1Y)' },
    { key: 'fromHigh', label: '고점대비' }, { key: 'vol', label: '변동성', neutral: true },
];
