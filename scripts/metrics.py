"""계산 레이어: 순수 함수만. 나중에 에이전트(LLM 요약 등)도 이걸 그대로 재사용."""
import numpy as np
import pandas as pd

PERIODS = {"d1": 1, "w1": 5, "m1": 21, "m3": 63, "m6": 126, "y1": 252}


def period_return(s: pd.Series, n: int) -> float:
    s = s.dropna()
    if len(s) <= n:
        return np.nan
    return s.iloc[-1] / s.iloc[-1 - n] - 1


def ytd_return(s: pd.Series) -> float:
    s = s.dropna()
    if s.empty:
        return np.nan
    year = s.index[-1].year
    prev = s[s.index.year < year]
    base = prev.iloc[-1] if not prev.empty else s[s.index.year == year].iloc[0]
    return s.iloc[-1] / base - 1


def max_drawdown(s: pd.Series, window: int = 252) -> float:
    s = s.dropna().iloc[-window:]
    if s.empty:
        return np.nan
    return (s / s.cummax() - 1).min()


def volatility(s: pd.Series, window: int = 252) -> float:
    r = s.dropna().pct_change().iloc[-window:]
    return r.std() * np.sqrt(252)


def compute_metrics(s: pd.Series) -> dict:
    """수익률 계열은 % 단위"""
    s = s.dropna()
    if s.empty:
        return {}
    m = {"price": float(s.iloc[-1]), "asof": s.index[-1].strftime("%Y-%m-%d")}
    for k, n in PERIODS.items():
        m[k] = period_return(s, n) * 100
    m["ytd"] = ytd_return(s) * 100
    m["mdd1y"] = max_drawdown(s, 252) * 100
    m["fromHigh"] = (s.iloc[-1] / s.iloc[-252:].max() - 1) * 100
    m["vol"] = volatility(s) * 100
    return m
