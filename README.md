# 💰 WealthWise

### *Can we see the future before we invest in it?*

**WealthWise** is a financial decision simulator that we built to make investing and financial planning easier to understand.

We noticed that many people can access financial products, but understanding what might happen to their money over time can still be confusing. Concepts like **compounding, inflation, returns, and risk** can feel complicated when they are presented only through formulas or a single final number.

So, we came up with **WealthWise**.

Instead of simply telling you *"your money may become this much,"* WealthWise lets you **change your assumptions, try different scenarios, and explore different possible outcomes.**

---

## 💡 Why Did We Build WealthWise?

Imagine you are investing **₹5,000 every month for 15 years**.

What happens if you invest ₹10,000 instead?

What if you invest for 20 years?

What if the returns are different from what you expected?

These are the kinds of questions we wanted users to explore.

Traditional calculators usually give you **one result**.

WealthWise asks:

> **"What if I change this?"**

And then lets you see what could happen.

---

## 🎯 The Problem

Millions of people have access to financial products, but many still find it difficult to understand financial decisions.

Some of the important factors are:

* 📈 Compounding
* 💸 Inflation
* ⚠️ Investment uncertainty
* 🎯 Long-term financial goals

The problem is not only **access to financial products**.

It is also **understanding the decisions behind them**.

---

## 🚀 What Does WealthWise Do?

WealthWise follows a simple process:

```text
INPUT
  ↓
Calculate
  ↓
Simulate
  ↓
Compare
  ↓
Adjust
  ↓
Explore Again
```

Users can enter things like:

* Monthly investment
* Investment duration
* Expected return
* Financial goals

The system then calculates the results and allows users to explore different scenarios.

---

## 🎲 The Interesting Part — Monte Carlo Simulation

One of the main features of WealthWise is **Monte Carlo simulation**.

Real-world investment returns don't necessarily follow one fixed number every year.

So instead of showing only one expected result, WealthWise creates **5,000 possible return paths**.

The process is roughly:

```text
Generate a possible return path
          ↓
Compound it over time
          ↓
Repeat thousands of times
          ↓
Collect the results
          ↓
Show the range of possibilities
```

This gives users a better way to understand uncertainty.

**It is not predicting the future. It is helping users explore possible futures.**

---

## 🧮 What Happens Behind the Scenes?

WealthWise has different layers working together.

```text
React + TypeScript
        ↓
      Flask
        ↓
Financial Calculation Engine
        ↓
Monte Carlo Simulation
        ↓
SQLite Database
```

### Frontend

The frontend handles the interface, inputs, charts, and scenario controls.

### Backend

The Python + Flask backend receives requests and manages the application logic.

### Financial Engine

This handles calculations such as:

* SIP growth
* Compounding
* Inflation adjustment
* Goal-based calculations

### Simulation Engine

The Monte Carlo engine generates different possible return paths and summarizes the results.

### Database

SQLite is used for storing saved plans and scenario data.

---

## 📊 Financial Calculations

WealthWise uses standard financial calculations to make the results understandable and transparent.

For example, SIP growth is calculated using a compounding-based formula:

```text
FV = P × [((1+r)^n − 1) / r]
```

We also consider inflation so that users can understand the difference between a future amount and its purchasing power.

The idea is simple:

> **Transparent assumptions → Clear calculations → Understandable results**

---

## 👥 Who Is WealthWise For?

We designed WealthWise with different kinds of users in mind.

### 🎓 Students

To understand investing and compounding in a simple way.

### 💼 Young Earners

To explore long-term investment scenarios.

### 👨‍👩‍👧 Families

To think about financial goals and inflation.

### 🎯 Goal Planners

To experiment with retirement or other long-term goals.

The goal is not to tell users what decision to make.

The goal is to help them **understand the possible outcomes of their decisions.**

---

## 🖥️ Our Prototype

We created a working prototype where users can interact with the simulator.

For example:

```text
₹5,000 / month
15 years
10% assumption
        ↓
Calculate
        ↓
Simulate
        ↓
Explore the result
```

One of the easiest ways to demonstrate WealthWise is to change the monthly investment from:

**₹5,000 → ₹10,000**

and immediately see how the result changes.

This makes the concept much more interactive than a traditional calculator.

---

## 🌟 What Makes WealthWise Different?

We don't want WealthWise to simply be another investment calculator.

The main idea is **experimentation**.

Instead of:

> ❌ "Here is your final number."

We want users to experience:

> ✅ "What happens if I change this?"

They can try different assumptions, compare scenarios, and learn how financial decisions affect possible outcomes.

---

## 🛠️ Tech Stack

| Part             | Technology         |
| ---------------- | ------------------ |
| Frontend         | React + TypeScript |
| UI / Prototype   | Lovable            |
| Backend          | Python + Flask     |
| Financial Engine | Python             |
| Simulation       | Monte Carlo        |
| Database         | SQLite             |

---

## 🔄 Our Workflow

```text
1️⃣ Enter your financial details
             ↓
2️⃣ Calculate the expected growth
             ↓
3️⃣ Generate possible scenarios
             ↓
4️⃣ Compare the outcomes
             ↓
5️⃣ Change your assumptions
             ↓
6️⃣ Explore again
```

That's the heart of WealthWise.

---

## ⚠️ Important Note

WealthWise is an **educational simulation tool**.

The results shown by the simulator are hypothetical and depend on the assumptions provided by the user. They should not be considered guaranteed returns or personal financial advice.

---

## ❤️ Our Vision

We believe financial planning shouldn't feel like looking at a complicated spreadsheet.

It should be something people can **explore, understand, and learn from.**

With WealthWise, we want to turn financial uncertainty into something people can interact with.

> ### **Don't just plan your money.**
>
> ### **Understand the future you're planning for.**

---

## 📌 Project Status

🚧 **Working Prototype**

Built as a hackathon project to demonstrate how financial calculations, scenario testing, and Monte Carlo simulation can be brought together into an interactive financial decision simulator.

---

## 📚 Sources

The statistics used in our project presentation include:

* **NCFE-FLIS 2019 / National Strategy for Financial Education 2020–25**
* **AMFI Annual Mutual Fund Report 2025**

These sources are referenced in the project presentation.

---

### 🌱 Built with an idea in mind:

**Make financial decisions easier to understand — one scenario at a time.**
