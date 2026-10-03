"""config/universe.json 을 읽어 가격/지표를 계산하고 data/*.json 으로 저장.
웹(index.html)은 이 JSON만 읽음 → 브라우저에서 API 호출/CORS 문제 없음.

로컬 실행:  python scripts/build_data.py
자동 실행:  .github/workflows/update-data.yml (평일 하루 2회)
"""
import json
import math
from datetime import datetime, timezone, timedelta
from pathlib import Path

import pandas as pd
import yfinance as yf

from metrics import compute_metrics, period_return

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / "config" / "universe.json"
OUT = ROOT / "data"
KST = timezone(timedelta(hours=9))

INFO_FIELDS = {
    "sector": "sector", "industry": "industry", "marketCap": "marketCap",
    "per": "trailingPE", "fper": "forwardPE", "pbr": "priceToBook",
    "roe": "returnOnEquity", "opm": "operatingMargins", "revg": "revenueGrowth",
    "divy": "dividendYield", "beta": "beta", "currency": "currency",
    "longName": "longName",
}


def clean(x):
    """NaN/inf → None (JSON null), 숫자는 반올림"""
    if isinstance(x, dict):
        return {k: clean(v) for k, v in x.items()}
    if isinstance(x, list):
        return [clean(v) for v in x]
    if isinstance(x, float):
        if math.isnan(x) or math.isinf(x):
            return None
        return round(x, 4)
    return x


def download_prices(tickers: list[str]) -> pd.DataFrame:
    raw = yf.download(tickers, period="3y", auto_adjust=True, progress=False, group_by="column")
    close = raw["Close"]
    if isinstance(close, pd.Series):
        close = close.to_frame(tickers[0])
    close.index = pd.to_datetime(close.index).tz_localize(None)
    return close.dropna(how="all")


def fetch_info(t: str) -> dict:
    try:
        info = yf.Ticker(t).info or {}
    except Exception as e:
        print(f"  info 실패 {t}: {e}")
        return {}
    return {k: info.get(v) for k, v in INFO_FIELDS.items()}


def main():
    cfg = json.loads(CONFIG.read_text(encoding="utf-8"))

    # 이름/그룹 정리
    names, groups = {}, {}
    for t, n in cfg["watchlist"].items():
        names[t], groups[t] = n, "watchlist"
    for t, n in cfg["benchmarks"].items():
        names.setdefault(t, n); groups.setdefault(t, "benchmark")
    for uni in cfg["sectors"].values():
        for t, n in uni["items"].items():
            names.setdefault(t, n); groups.setdefault(t, "sector")
        groups.setdefault(uni["bench"], "benchmark")

    tickers = list(names.keys())
    print(f"가격 다운로드: {len(tickers)}개")
    prices = download_prices(tickers)

    # 1) 종목별 지표 + 기본정보
    out_tickers = {}
    for t in tickers:
        if t not in prices.columns or prices[t].dropna().empty:
            print(f"  데이터 없음: {t}")
            continue
        entry = {"name": names[t], "group": groups[t], "metrics": compute_metrics(prices[t])}
        if groups[t] == "watchlist":
            entry["info"] = fetch_info(t)
        out_tickers[t] = entry

    # 2) 섹터 스크리닝 (벤치마크 대비 상대강도)
    out_sectors = {}
    for uni_name, uni in cfg["sectors"].items():
        b = uni["bench"]
        if b not in prices.columns:
            continue
        rows = []
        for t, n in uni["items"].items():
            if t not in out_tickers:
                continue
            row = {"ticker": t, "name": n, **out_tickers[t]["metrics"]}
            for key, days in (("rs3m", 63), ("rs6m", 126)):
                row[key] = (period_return(prices[t], days) - period_return(prices[b], days)) * 100
            rows.append(row)
        out_sectors[uni_name] = {"bench": b, "benchName": names.get(b, b), "rows": rows}

    # 3) 가격 시계열 (차트용): 날짜 배열 하나 + 티커별 값 배열
    p = prices[list(out_tickers.keys())]
    series = {
        "dates": [d.strftime("%Y-%m-%d") for d in p.index],
        "close": {t: [None if pd.isna(v) else round(float(v), 4) for v in p[t]] for t in p.columns},
    }

    meta = {"updated": datetime.now(KST).strftime("%Y-%m-%d %H:%M KST")}
    OUT.mkdir(exist_ok=True)
    (OUT / "market.json").write_text(
        json.dumps(clean({**meta, "tickers": out_tickers, "sectors": out_sectors}), ensure_ascii=False),
        encoding="utf-8")
    (OUT / "prices.json").write_text(json.dumps(clean(series), separators=(",", ":")), encoding="utf-8")
    print(f"완료: {len(out_tickers)}개 종목 → data/market.json, data/prices.json")


if __name__ == "__main__":
    main()
