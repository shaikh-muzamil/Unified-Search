import { SlackResult } from './slack';

interface NotionResult {
    title: string;
    url: string;
    object: string;
    icon?: string;
}

interface DemoResults {
    slack: SlackResult[];
    notion: NotionResult[];
}

const DEMO_DATA: Record<string, DemoResults> = {
    pricing: {
        slack: [
            {
                type: 'message', text: 'Hey team, just wrapped up the pricing call with the enterprise customer. They pushed back on the $49/seat tier — think we need to revisit our packaging. Sarah suggested a "Starter" plan at $19/mo flat.', user: 'alex.morgan', channel: 'sales', ts: '1711000000', permalink: '#'
            },
            {
                type: 'message', text: 'Agree with Sarah. Most of our trial users are under 10 seats. A flat $19 starter would convert WAY better than per-seat for SMBs. Let\'s A/B test it in Q2.', user: 'jamie.chen', channel: 'growth', ts: '1711003600', permalink: '#'
            },
            {
                type: 'message', text: 'Pricing page bounce rate is 68%. Users are getting confused between the tiers. I\'d recommend simplifying to just Free / Pro / Enterprise. Less friction = more conversions.', user: 'priya.k', channel: 'product', ts: '1711007200', permalink: '#'
            },
        ],
        notion: [
            { title: 'Pricing Strategy 2026', url: '#', object: 'page', icon: '💰' },
            { title: 'Competitor Pricing Analysis', url: '#', object: 'page', icon: '📊' },
            { title: 'Revenue & Growth Targets', url: '#', object: 'database', icon: '📈' },
        ]
    },
    roadmap: {
        slack: [
            {
                type: 'message', text: 'Q2 roadmap is locked. Top priorities: (1) AI search synthesis, (2) mobile app MVP, (3) Slack + Notion deep integration. Anything else needs to go to the backlog.', user: 'sarah.lee', channel: 'product', ts: '1711010800', permalink: '#'
            },
            {
                type: 'message', text: 'Heads up — the mobile app got pushed to Q3. Engineering needs to finish the API v2 refactor first before building on top of it. Roadmap doc updated.', user: 'dev.lead', channel: 'engineering', ts: '1711014400', permalink: '#'
            },
            {
                type: 'message', text: 'Customer feedback from last sprint: #1 request is bulk export and #2 is better filter options on the search results page. Both are now flagged for Q2.', user: 'jamie.chen', channel: 'feedback', ts: '1711018000', permalink: '#'
            },
        ],
        notion: [
            { title: 'Q2 2026 Product Roadmap', url: '#', object: 'page', icon: '🗺️' },
            { title: 'Feature Backlog', url: '#', object: 'database', icon: '📋' },
            { title: 'Sprint Planning Notes', url: '#', object: 'page', icon: '🏃' },
        ]
    },
    onboarding: {
        slack: [
            {
                type: 'message', text: 'New user onboarding flow is underperforming. Only 34% of signups connect at least one integration in their first session. We need to make the "Connect Slack" step impossible to miss.', user: 'growth.team', channel: 'growth', ts: '1711021600', permalink: '#'
            },
            {
                type: 'message', text: 'Tested a new onboarding checklist UI — users who see the progress bar (Connect → Search → Find) have 2x completion rate. Shipping to prod next week.', user: 'priya.k', channel: 'product', ts: '1711025200', permalink: '#'
            },
            {
                type: 'message', text: 'Welcome email sequence is live! Day 0 welcome, Day 2 tip on using filters, Day 5 case study. Open rates are at 61% which is great — let\'s keep refining.', user: 'marketing', channel: 'marketing', ts: '1711028800', permalink: '#'
            },
        ],
        notion: [
            { title: 'User Onboarding Playbook', url: '#', object: 'page', icon: '🎯' },
            { title: 'Activation Metrics Dashboard', url: '#', object: 'database', icon: '📊' },
            { title: 'Email Sequence Templates', url: '#', object: 'page', icon: '📧' },
        ]
    },
    design: {
        slack: [
            {
                type: 'message', text: 'New design system is ready for review in Figma. We\'re standardizing on 8px grid, Inter font family, and a new dark-mode-first color palette. Feedback needed by EOW.', user: 'ux.lead', channel: 'design', ts: '1711032400', permalink: '#'
            },
            {
                type: 'message', text: 'The search results card redesign tested really well with users. Cleaner information hierarchy, source badges are more prominent. Implementing in the next sprint.', user: 'mia.r', channel: 'design', ts: '1711036000', permalink: '#'
            },
            {
                type: 'message', text: 'Brand refresh is done! New logo, updated color tokens in the design system. Check the Notion doc for implementation guidelines for eng.', user: 'ux.lead', channel: 'general', ts: '1711039600', permalink: '#'
            },
        ],
        notion: [
            { title: 'Design System v2.0', url: '#', object: 'page', icon: '🎨' },
            { title: 'Figma Component Library Guide', url: '#', object: 'page', icon: '🖼️' },
            { title: 'Brand Guidelines', url: '#', object: 'page', icon: '✨' },
        ]
    },
    marketing: {
        slack: [
            {
                type: 'message', text: 'Product Hunt launch scheduled for April 15th. Need: video demo (60s), 5 screenshots, tagline options. Can everyone submit their top 3 tagline ideas by Thursday?', user: 'marketing', channel: 'marketing', ts: '1711043200', permalink: '#'
            },
            {
                type: 'message', text: 'LinkedIn campaign from last week drove 240 signups at $4.20 CPA. WAY better than Google Ads which was running at $18 CPA. Shifting 70% of budget to LinkedIn.', user: 'growth.team', channel: 'growth', ts: '1711046800', permalink: '#'
            },
            {
                type: 'message', text: 'The "Stop digging, start finding" copy is resonating best in A/B tests. 28% higher CTR than our previous hero headline. Using this going forward.', user: 'content.lead', channel: 'marketing', ts: '1711050400', permalink: '#'
            },
        ],
        notion: [
            { title: 'Go-to-Market Strategy', url: '#', object: 'page', icon: '🚀' },
            { title: 'Content Calendar Q2', url: '#', object: 'database', icon: '📅' },
            { title: 'Product Hunt Launch Checklist', url: '#', object: 'page', icon: '🏆' },
        ]
    },
};

const FALLBACK: DemoResults = {
    slack: [
        {
            type: 'message', text: 'Just pushed the latest build. All integration tests passing. Can someone from product review the new search filters before we merge?', user: 'dev.lead', channel: 'engineering', ts: '1711054000', permalink: '#'
        },
        {
            type: 'message', text: 'Weekly all-hands recap: growth is up 18% MoM, new enterprise deal signed, and team hit all sprint goals. Great week everyone! 🎉', user: 'ceo', channel: 'general', ts: '1711057600', permalink: '#'
        },
    ],
    notion: [
        { title: 'Company Wiki & Handbook', url: '#', object: 'page', icon: '📚' },
        { title: 'Team Meeting Notes', url: '#', object: 'database', icon: '📝' },
    ]
};

export function getDemoResults(query: string): DemoResults {
    const q = query.toLowerCase().trim();

    for (const [keyword, data] of Object.entries(DEMO_DATA)) {
        if (q.includes(keyword)) return data;
    }

    // Try partial matches
    if (q.includes('price') || q.includes('plan') || q.includes('cost')) return DEMO_DATA.pricing;
    if (q.includes('road') || q.includes('sprint') || q.includes('ship')) return DEMO_DATA.roadmap;
    if (q.includes('user') || q.includes('signup') || q.includes('activation')) return DEMO_DATA.onboarding;
    if (q.includes('brand') || q.includes('ui') || q.includes('color') || q.includes('figma')) return DEMO_DATA.design;
    if (q.includes('launch') || q.includes('campaign') || q.includes('growth')) return DEMO_DATA.marketing;

    return FALLBACK;
}
