"""
Finance Simulator — Flask backend
---------------------------------
Run:
    pip install -r requirements.txt
    python app.py            # serves http://localhost:5000/api

Then in the website header open "Python & SQL" and switch to "Live Flask Backend".
Educational tool only. Returns are assumptions, not guarantees or financial advice.
"""
import os
import sqlite3
import random
import math
from datetime import datetime

from flask import Flask, jsonify, request, g
from flask_cors import CORS

DB_PATH = os.environ.get("FS_DB_PATH", "finance_simulator.db")
SCHEMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")

app = Flask(__name__)
CORS(app)  # allow the website (any origin) to call the API


# ---------------------------------------------------------------- database
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    with sqlite3.connect(DB_PATH) as conn, open(SCHEMA_PATH) as f:
        conn.executescript(f.read())


# ------------------------------------------------------ calculation engine
def future_value(monthly: float, years: float, annual_rate: float) -> float:
    """SIP future value: contribution at start of month, monthly compounding."""
    n = int(round(years * 12))
    if n <= 0:
        return 0.0
    r = annual_rate / 12
    if r == 0:
        return monthly * n
    return monthly * (((1 + r) ** n - 1) / r) * (1 + r)


def required_monthly(target: float, years: float, annual_rate: float) -> float:
    unit = future_value(1, years, annual_rate)
    return target / unit if unit > 0 else 0.0


def load_scenarios():
    rows = get_db().execute(
        "SELECT scenario_key AS key, label, annual_return AS rate FROM scenario_assumptions ORDER BY annual_return"
    ).fetchall()
    return [dict(r) for r in rows]


def calculate(monthly: float, years: int, scenarios):
    total = monthly * years * 12
    results = []
    for s in scenarios:
        fv = future_value(monthly, years, s["rate"])
        results.append({
            **s,
            "total_invested": total,
            "final_corpus": fv,
            "wealth_gained": fv - total,
            "growth_ratio": fv / total if total else 0,
        })
    rate = {s["key"]: s["rate"] for s in scenarios}
    series = [{
        "year": y,
        "invested": monthly * 12 * y,
        "cautious": future_value(monthly, y, rate.get("cautious", 0)),
        "expected": future_value(monthly, y, rate.get("expected", 0)),
        "optimistic": future_value(monthly, y, rate.get("optimistic", 0)),
    } for y in range(years + 1)]
    return {"monthly_investment": monthly, "years": years, "total_invested": total,
            "scenarios": results, "series": series}


def monte_carlo(monthly, years, mean_return, volatility, target, sims=5000):
    mu = math.log(1 + mean_return) / 12 - volatility ** 2 / 24
    sd = volatility / math.sqrt(12)
    finals = []
    for _ in range(sims):
        v = 0.0
        for _m in range(years * 12):
            v = (v + monthly) * math.exp(random.gauss(mu, sd))
        finals.append(v)
    finals.sort()
    q = lambda p: finals[min(len(finals) - 1, int(p * len(finals)))]
    return {"p10": q(0.1), "p50": q(0.5), "p90": q(0.9),
            "probability": sum(f >= target for f in finals) / sims,
            "total_invested": monthly * 12 * years}


def validate(monthly, years):
    if not (500 <= monthly <= 10_000_000):
        return "monthly_investment must be between 500 and 1,00,00,000"
    if not (1 <= years <= 50):
        return "years must be between 1 and 50"
    return None


# ------------------------------------------------------------------ routes
@app.get("/api/health")
def health():
    return jsonify(status="ok")


@app.get("/api/scenarios")
def scenarios():
    return jsonify(load_scenarios())


@app.post("/api/calculate")
def api_calculate():
    body = request.get_json(force=True) or {}
    monthly = float(body.get("monthly_investment", 0))
    years = int(body.get("years", 0))
    err = validate(monthly, years)
    if err:
        return jsonify(error=err), 400
    # Client may send customised rates (Advanced Settings); fall back to DB values.
    scen = body.get("scenarios") or load_scenarios()
    return jsonify(calculate(monthly, years, scen))


@app.post("/api/goal")
def api_goal():
    body = request.get_json(force=True) or {}
    target = float(body["target"])
    years = int(body["years"])
    rate = float(body.get("rate", 0.10))
    return jsonify(required_monthly=required_monthly(target, years, rate))


@app.post("/api/monte-carlo")
def api_monte_carlo():
    b = request.get_json(force=True) or {}
    return jsonify(monte_carlo(float(b["monthly_investment"]), int(b["years"]),
                               float(b.get("mean_return", 0.10)), float(b.get("volatility", 0.15)),
                               float(b.get("target", 0)), int(b.get("sims", 2000))))


@app.post("/api/simulations")
def save_simulation():
    b = request.get_json(force=True) or {}
    db = get_db()
    cur = db.execute(
        "INSERT INTO simulations (user_id, name, monthly_investment, years, created_at) VALUES (?, ?, ?, ?, ?)",
        (b.get("user_id"), b.get("name", "Untitled"), b["monthly_investment"], b["years"],
         datetime.utcnow().isoformat()),
    )
    sim_id = cur.lastrowid
    for s in calculate(float(b["monthly_investment"]), int(b["years"]),
                       b.get("scenarios") or load_scenarios())["scenarios"]:
        db.execute(
            "INSERT INTO simulation_results (simulation_id, scenario_key, annual_return, total_invested, final_corpus, wealth_gained)"
            " VALUES (?, ?, ?, ?, ?, ?)",
            (sim_id, s["key"], s["rate"], s["total_invested"], s["final_corpus"], s["wealth_gained"]),
        )
    db.commit()
    return jsonify(id=sim_id), 201


@app.get("/api/simulations")
def list_simulations():
    rows = get_db().execute("""
        SELECT s.id, s.name, s.monthly_investment, s.years, s.created_at,
               r.final_corpus AS expected_corpus, r.total_invested
        FROM simulations s
        LEFT JOIN simulation_results r ON r.simulation_id = s.id AND r.scenario_key = 'expected'
        ORDER BY s.created_at DESC
    """).fetchall()
    return jsonify([{**dict(r), "id": str(r["id"]), "scenarios": []} for r in rows])


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
