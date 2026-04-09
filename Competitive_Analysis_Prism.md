# Competitive Analysis Report: Prism vs. Unified Search Ecosystem

## 1. Executive Summary
Prism is entering the rapidly evolving "Unified Enterprise Search and AI Assistant" market. By integrating Slack, Notion, and Google Workspace into a single accessible interface and offering proactive features like the Weekly AI Digest, Prism serves as a knowledge layer for modern teams. 

This report analyzes top competitors (Glean, GoSearch, Dust, Guru, and Onyx) to identify their strengths, weaknesses, and pricing models. We also outline actionable insights on what Prism should emulate and how Prism can uniquely differentiate itself in the market.

## 2. Competitive Landscape

### A. Glean
*   **Target Market:** Large Enterprises (100+ seats).
*   **Key Features:** Advanced enterprise knowledge graph, 100+ integrations, generative AI answers, permission-aware search.
*   **Pricing:** Custom enterprise quotes (estimated $45–$65+ per user/month), long implementation cycles.
*   **Threat Level:** High for enterprise, Low for startups/SMBs due to cost and complexity.

### B. GoSearch
*   **Target Market:** Mid-market and scaling startups.
*   **Key Features:** AI-native search agents, hybrid search architecture (respects real-time privacy), browser sidebar.
*   **Pricing:** Free tier available; Pro starts at $20/user/month.
*   **Threat Level:** High. They appeal to a similar demographic but focus heavily on complex "agentic workflows" (AI agents updating Jira, Salesforce, etc.).

### C. Dust.tt
*   **Target Market:** Teams wanting custom AI agents.
*   **Key Features:** Agent builder, multi-model flexibility (Claude, GPT-4, Gemini), Slack/Notion integrations.
*   **Pricing:** €29/user/month.
*   **Threat Level:** Medium. Dust focuses more on "building bots" rather than offering a turnkey unified search experience out of the box.

### D. Guru
*   **Target Market:** Teams needing verified, governed knowledge.
*   **Key Features:** Expert verification workflows, bite-sized "knowledge cards", strong Chrome extension.
*   **Pricing:** Starter, Builder, and Custom Enterprise tiers.
*   **Threat Level:** Medium. Guru is transitioning heavily into enterprise engagements and focuses more on creating a company wiki/intranet rather than pure unified search.

### E. Onyx (formerly Danswer) & Unleash
*   **Target Market:** Developers, Startups, Budget-conscious teams.
*   **Key Features:** Open-source (Onyx) or heavily discounted (Unleash) search tools.
*   **Threat Level:** Medium. Onyx appeals to highly technical teams willing to self-host.

---

## 3. What We Should Copy (Adopt & Adapt)
To meet baseline user expectations in 2026, Prism should adopt the following standard industry practices:

1.  **In-Workflow Access (Browser Extensions):** 
    Competitors like Glean and Guru thrive because they don't require users to visit a separate destination. **Action:** Prism should eventually develop a simple Chrome extension (e.g., replacing the "New Tab" page or adding a quick CMD+K search bar) so users can search without leaving their current tab.
2.  **Permission-Aware Search:** 
    Enterprise platforms ensure users only see search results they are authorized to view. **Action:** Continue ensuring OAuth scopes (like Google Drive readonly) are strictly mapped to the individual user’s session, preventing data leakage across the organization.
3.  **Conversational vs. Keyword:** 
    GoSearch and Glean use generative AI to synthesize answers rather than just returning a list of links. **Action:** Prism is already doing this with its `synthesizeAnswer` function. Continue refining the prompt to ensure the AI always cites its sources (e.g., "According to this Slack thread with John...").

---

## 4. How We Can Differentiate (The Prism Advantage)
Trying to beat Glean on the number of integrations (100+) is a losing battle. Prism must win on **Simplicity, Proactivity, and Price.**

### A. The "Proactive" Knowledge Assistant 
*   **The Competitor Way:** Wait for the user to ask a question.
*   **The Prism Way:** The Weekly AI Digest (via Groq/Resend).
*   **Strategy:** Double down on the Digest. None of the SMB competitors heavily market automated, proactive summaries of what happened across the company. Position Prism not just as a "search engine" but as an automated Chief of Staff that briefs the team on Monday mornings about critical Slack decisions, Notion document updates, and Drive files.

### B. Radically Fast Setup
*   **The Competitor Way:** Complex POCs, sales calls, and weeks of data indexing.
*   **The Prism Way:** Connect Slack, Notion, and Google in 3 clicks. 
*   **Strategy:** Own the "Turnkey Startup" niche. Focus exclusively on the tools startups actually use (Slack, Notion, Google Workspace, maybe GitHub next). By intentionally limiting integrations, you ensure the ones you have work flawlessly and take 60 seconds to set up.

### C. Transparent, Disruptive Pricing
*   **The Competitor Way:** Hidden pricing ($50+/user) or €29/user minimums.
*   **The Prism Way:** Flat rate or highly affordable per-seat pricing.
*   **Strategy:** Startups are fatigued by expensive AI tool subscriptions. Offer a simple, transparent SaaS model (e.g., $10-$12/user/month or a flat $99/mo for teams up to 20). 

### D. Impeccable, Vibrant UI
*   **The Competitor Way:** Sterile, corporate, enterprise dashboards.
*   **The Prism Way:** Consumer-grade aesthetics. 
*   **Strategy:** You've recently invested in kinetic typography and highly polished branding (dark mode, glassmorphism). Keep this up. Startups buy tools that feel delightful and modern. 

## 5. Conclusion & Next Steps
Prism has a strong foundation. The immediate path to growth is not building 50 more integrations, but rather perfecting the **Slack + Notion + Google** triad. 

**Immediate Recommendation for the Seed Pitch:** Angle the pitch around the "Proactive Assistant." Investors know Glean owns enterprise search. Pitch Prism as the affordable, fast, and proactive alternative for the next 10,000 startups.
