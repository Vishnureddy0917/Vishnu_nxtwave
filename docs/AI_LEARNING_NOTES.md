# LaunchLoop AI — Documented AI Learning Notes

This document captures three concrete, authentic design and architectural decisions made during the construction of LaunchLoop AI, formatted in the mandatory structure:

**What I asked → What AI initially suggested → What I changed → Why**

---

## Example 1: Local NoSQL Persistence & Concurrency Architecture

### What I asked
> *"How should I implement the file-based persistent local database in Node.js to store registrations and referral events without using SQLite, MongoDB, or external database engines?"*

### What AI initially suggested
AI initially proposed a simple file-per-collection abstraction where each write directly calls `fs.promises.writeFile(filePath, JSON.stringify(data))` on the target JSON file whenever a new registration is submitted.

### What I changed
I rejected direct `fs.writeFile` overwrites and introduced three critical architectural enhancements:
1. **Atomic File Persistence:** Implemented writing to a unique temporary file (`${filePath}.tmp.${Date.now()}_${rand}`) followed by an atomic `fs.promises.rename` to replace the active file in a single OS filesystem operation.
2. **In-Memory Write Serialization Queue (Mutex):** Implemented a per-collection Promise chain queue in Node.js so that asynchronous requests (such as concurrent student registrations) never interleave reads and writes or overwrite each other's data.
3. **Corruption Detection & Forensics Recovery:** Implemented safe error handling in `readCollection`: if `JSON.parse` encounters malformed JSON (e.g. from an abrupt process termination), it preserves the corrupted file as `${filePath}.corrupt.${Date.now()}` for inspection rather than silently wiping existing data, and safely boots a fresh empty store.
4. **Windows EPERM/EBUSY Retry Mechanism:** Handled Windows-specific file locking where atomic rename can intermittently fail with `EPERM` by adding exponential backoff retries and copyFile fallback.

### Why
Direct `fs.writeFile` in a multi-client web server is prone to severe race conditions: two students submitting at the same second would cause the second write to overwrite the first, causing lost registrations. Furthermore, if the server restarts mid-write, direct writing leaves a truncated, half-written JSON file that destroys the entire collection. Atomic renames with write serialization guarantee durability and consistency for the challenge demo.

---

## Example 2: Referral Engine & Anti-Fraud Security

### What I asked
> *"How should I structure the student referral mechanism to attribute peer signups and calculate verified counts?"*

### What AI initially suggested
AI initially suggested storing a `referralCount: number` directly as an integer counter on the student's registration document and incrementing it by 1 whenever an incoming registration form included their code. It also suggested storing the referral code in a browser cookie.

### What I changed
I completely replaced the simple counter approach with an immutable event-sourced ledger model:
1. **Dedicated `referralEvents` Collection:** Referral credit is never a mutable counter. It is stored as an immutable audit event document (`id`, `referrerRegistrationId`, `referrerCode`, `referredRegistrationId`, `referredEmailMasked`, `createdAt`, `status: 'verified'`).
2. **Deterministic Server-Side Verification:** The verified referral count is calculated dynamically by aggregating verified referral events.
3. **Anti-Self-Referral & Anti-Duplicate Guards:**
   * Rejects self-referrals if the referrer's email matches the candidate's normalized email or registration ID.
   * Restricts each referred student to exactly one valid referrer (first verified attribution wins).
   * Validates that the referral code belongs to an active, verified registration in the database before granting credit.
4. **Privacy-Preserving Display Layer:** Instead of exposing student emails or raw names on the public leaderboard, the backend dynamically generates privacy pseudonyms (e.g., "Rahul Sharma" $\rightarrow$ "Rahul S.") and honors explicit opt-out preferences.

### Why
A naive mutable integer counter (`count = count + 1`) is easily manipulated, vulnerable to race conditions under concurrent submissions, and provides zero auditability into who referred whom. An event-sourced ledger ensures that every verified referral is provable, prevents duplicate reward claims, and makes the public leaderboard indisputably accurate and privacy-compliant.

---

## Example 3: Explainable Growth Intelligence vs Generative Cloud LLM

### What I asked
> *"How should I design the AI-assisted growth recommendation and campaign optimization feature for the admin dashboard?"*

### What AI initially suggested
AI initially suggested integrating an OpenAI or Anthropic API endpoint to pass campaign metrics in a prompt and stream back natural language marketing suggestions using a Generative AI LLM.

### What I changed
I rejected calling paid external cloud LLMs and instead architected a **deterministic, explainable growth rules engine**:
1. **Zero External API Costs:** The recommendation engine runs 100% locally with zero cloud subscriptions, zero API keys, and zero external network latency.
2. **Deterministic Bayesian Heuristics:** Codified 6 transparent campaign optimization rules based on statistical thresholds:
   * Channel conversion friction anomaly detection (visits $\ge 20$, conversion $< 7.5\%$).
   * Referral viral coefficient lag ($K < 0.25$, participation $< 25\%$).
   * Campus institutional density clustering ($\ge 15$ registrations from a single engineering college).
   * Budget pacing deficit vs target ($< 55\%$ pacing with budget headroom $\ge ₹400$).
   * Low-sample-size early warning heuristic ($< 15$ registrations).
   * Viral surge momentum detection ($K \ge 0.35$).
3. **"Explain This Recommendation" Interactive Modal:** Every recommendation includes the exact mathematical evidence, triggering rule ID, raw metric values, specific action items, and risk of inaction.
4. **Strict Architectural Honesty:** Labeled explicitly in the UI and documentation as automated, rule-based growth intelligence rather than falsely claiming it to be a generative AI model.

### Why
Calling a paid LLM API introduces external failure points, requires credit card billing, introduces non-deterministic hallucinations, and violates the challenge constraint to run entirely locally without paid cloud accounts. A deterministic rule-based engine delivers explainable, reproducible, and mathematically grounded business value that a marketing manager can audit and trust.
