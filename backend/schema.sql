-- Finance Simulator schema (SQLite; works on MySQL/Postgres with minor type changes)

CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          VARCHAR(120) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,          -- never store plain passwords (use bcrypt/argon2)
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scenario_assumptions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    scenario_key  VARCHAR(20) NOT NULL UNIQUE,
    label         VARCHAR(40) NOT NULL,
    annual_return DECIMAL(5,4) NOT NULL
);

INSERT OR IGNORE INTO scenario_assumptions (scenario_key, label, annual_return) VALUES
    ('cautious',   'Cautious',   0.06),
    ('expected',   'Expected',   0.10),
    ('optimistic', 'Optimistic', 0.14);

CREATE TABLE IF NOT EXISTS simulations (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id            INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name               VARCHAR(120),
    monthly_investment DECIMAL(14,2) NOT NULL,
    years              INTEGER NOT NULL,
    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS simulation_results (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    simulation_id  INTEGER NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
    scenario_key   VARCHAR(20) NOT NULL,
    annual_return  DECIMAL(5,4) NOT NULL,
    total_invested DECIMAL(16,2) NOT NULL,
    final_corpus   DECIMAL(16,2) NOT NULL,
    wealth_gained  DECIMAL(16,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS goals (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER REFERENCES users(id) ON DELETE CASCADE,
    goal_type        VARCHAR(30) NOT NULL,   -- education, house, vehicle, wedding, retirement
    target_amount    DECIMAL(16,2) NOT NULL,
    years            INTEGER NOT NULL,
    required_monthly DECIMAL(14,2),
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);
