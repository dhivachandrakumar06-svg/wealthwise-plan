# 💰 WealthWise

### *Can we see the future before we invest in it?*

**WealthWise** is a financial decision simulator designed to help users understand how different financial decisions can affect their future wealth.

Instead of providing only a single projected value, WealthWise allows users to **change assumptions, compare scenarios, and explore thousands of possible outcomes**.

---

## 🎯 Problem Statement

Millions of people have access to financial products, but access does not always mean understanding.

Financial decisions involve concepts such as:

* 📈 Compounding
* 💸 Inflation
* ⚠️ Investment risk
* 🎯 Long-term financial goals

The WealthWise project highlights the financial-literacy gap identified in the **NCFE-FLIS 2019 survey**, where 27.18% of respondents met the minimum financial-literacy threshold.

---

## 💡 Our Idea

WealthWise changes the question from:

> **"Give me one number."**

to:

> **"Show me the possibilities."**

Users can experiment with different investment assumptions and observe how those changes affect potential outcomes.

---

## ✨ Key Features

### 📊 Financial Calculations

* SIP growth calculation
* Compound-growth calculations
* Inflation-adjusted values
* Goal-based investment calculations
* Scenario comparison

### 🎲 Monte Carlo Simulation

WealthWise generates **5,000 possible investment paths** rather than assuming that one expected return will always occur.

The simulation:

1. Samples a return path
2. Compounds it over time
3. Repeats the process thousands of times
4. Summarizes the resulting distribution

The output represents a **range of possible outcomes, not a guarantee**.

### 🔄 Scenario Experimentation

Users can modify variables such as:

* Monthly SIP
* Investment period
* Expected return assumptions
* Financial goals

They can then compare the resulting scenarios and adjust their decisions.

---

## 🏗️ Technical Architecture

WealthWise follows a layered architecture:

```text
┌──────────────────────────────┐
│          FRONTEND            │
│     React + TypeScript       │
│   UI • Charts • Scenarios    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        API / BACKEND         │
│        Python + Flask        │
│ Routes • Validation • Logic  │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       FINANCIAL ENGINE       │
│ SIP • Compounding • Inflation│
│          • Goals             │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       SIMULATION ENGINE      │
│         Monte Carlo          │
│  Random Paths • Percentiles  │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          DATA LAYER          │
│            SQLite            │
│   Plans • Scenario Data      │
└──────────────────────────────┘
```

The overall API flow is:

```text
Browser
   ↓
Backend
   ↓
Calculation / Simulation
   ↓
Response
   ↓
Visualization
```

The architecture and technology stack are based on the project presentation.

---

## 🧮 Financial Engine

WealthWise uses explicit financial models to make its calculations transparent and explainable.

### SIP / Compounding

```text
FV = P × [((1+r)^n − 1) / r]
```

Used to estimate the future value of recurring contributions.

### Inflation Adjustment

```text
Real Value = Future Value / (1+i)^n
```

Used to represent the effect of inflation on future purchasing power.

### Goal-Based Calculation

The system can work backwards from a financial target to estimate the required recurring contribution.

### Scenario Engine

Different combinations of:

```text
Investment Amount
        +
Investment Period
        +
Return Assumption
        ↓
   Scenario Result
```

This supports side-by-side assumption testing.

---

## 🎲 Monte Carlo Simulation

A major feature of WealthWise is its Monte Carlo simulation engine.

Rather than assuming that an investment will always achieve one fixed return, the system explores multiple possible return paths.

```text
Return Path
     ↓
Compound Over Time
     ↓
Repeat Thousands of Times
     ↓
Generate Distribution
     ↓
Lower ── Median ── Higher
```

WealthWise uses **5,000 simulated futures** to visualize the distribution of possible outcomes.

---

## 🖥️ Prototype

The working prototype allows users to enter financial assumptions and interactively explore the results.

Example demonstration:

```text
Monthly Investment: ₹5,000
Investment Period: 15 years
Return Assumption: 10%

        ↓

Financial Engine

        ↓

Simulation

        ↓

Result
```

The prototype also demonstrates how changing one assumption — for example, increasing the monthly investment from **₹5,000 to ₹10,000** — triggers a new calculation and result.

---

## 👥 Who Can Use WealthWise?

WealthWise is designed around different types of financial decision-makers:

| User                  | Possible Use                                |
| --------------------- | ------------------------------------------- |
| 🎓 Students           | Understand basic investing and compounding  |
| 👨‍💼 Young Earners   | Explore long-term wealth-building scenarios |
| 👨‍👩‍👧 Families     | Consider goals and inflation                |
| 🎯 Financial Planners | Test retirement and major financial goals   |

The project focuses on **experimentation and understanding**, rather than simply producing one final number.

---

## 🚀 Project Workflow

```text
1. INPUT
   ↓
   Income • SIP • Years

2. CALCULATE
   ↓
   Growth • Inflation • Goals

3. SIMULATE
   ↓
   5,000 Possible Paths

4. COMPARE
   ↓
   Scenarios • Percentiles

5. DECIDE
   ↓
   Adjust • Repeat
```

This workflow allows users to continuously test and refine their assumptions.

---

## 🛠️ Technology Stack

| Layer            | Technology         |
| ---------------- | ------------------ |
| Frontend         | React + TypeScript |
| UI / Prototype   | Lovable            |
| Backend          | Python             |
| API              | Flask              |
| Financial Engine | Python             |
| Simulation       | Monte Carlo        |
| Database         | SQLite             |

---

## 🌟 Why WealthWise?

WealthWise does not attempt to eliminate financial uncertainty.

Instead, it aims to make uncertainty **visible and understandable**.

Users can:

* **SEE** how assumptions affect outcomes
* **TEST** different possible paths
* **LEARN** the underlying financial concepts
* **PLAN** around their financial goals

The core idea is:

> **"Don't just plan your money. Understand the future you're planning for."**

---

## 📌 Project Status

🚧 **Working Prototype**

The current project demonstrates the financial calculation pipeline, scenario experimentation, and Monte Carlo simulation concept through an interactive prototype.

---

## ⚠️ Disclaimer

WealthWise is an **educational and simulation tool**. Its calculations and simulated outcomes are intended to help users understand financial concepts and explore hypothetical scenarios.

Simulated or projected results **do not represent guaranteed investment returns or financial advice**.

---

## 👩‍💻 Team

**WealthWise — Financial Decision Simulator**

Built as a project focused on making financial concepts more understandable through interactive simulation and scenario exploration.

---

## 📚 Sources

* National Council for Financial Education (NCFE) — National Strategy for Financial Education 2020–25
* NCFE Financial Literacy and Inclusion Survey (NCFE-FLIS) 2019
* Association of Mutual Funds in India (AMFI) — Annual Mutual Fund Report 2025

The statistics and source references above are the ones identified in the project presentation.

---

### ⭐ WealthWise

**Explore the possibilities. Understand the uncertainty. Plan with knowledge.**
