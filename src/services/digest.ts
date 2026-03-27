import { searchSlack } from './slack';
import Groq from 'groq-sdk';

interface User {
    id: number;
    email: string;
    name: string;
    slack_access_token?: string;
}

// Fetch recent messages by using a date query
// (Slack search ignores * wildcards and common stop words like "the" or "is")
async function fetchRecentSlackMessages(accessToken: string) {
    // 'before:tomorrow' is a trick to match effectively all messages,
    // and since we sort by timestamp desc, it yields the most recent 10.
    const queries = ['before:tomorrow', 'after:2020-01-01', 'has:reaction', 'has:link'];
    const seen = new Set<string>();
    const messages: any[] = [];

    for (const q of queries) {
        try {
            const results = await searchSlack(q, accessToken);
            for (const m of results) {
                if (!seen.has(m.ts)) {
                    seen.add(m.ts);
                    messages.push(m);
                }
            }
            if (messages.length >= 10) break;
        } catch { /* try next query */ }
    }

    return messages.slice(0, 10);
}


import { pool } from '../database';

export interface DigestStats {
    hoursSaved: string;
    itemsSurfaced: number;
    topIntegration: string;
    totalIntegrations: number;
}

export async function generateDigestForUser(user: User): Promise<{ summary: string, stats: DigestStats } | null> {
    if (!user.slack_access_token) return null;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    try {
        // --- Calculate Stats ---
        // Get search metrics for the last 7 days
        const { rows } = await pool.query(
            `SELECT 
                COUNT(*) as search_count,
                SUM(slack_results_count) as slack_sum,
                SUM(notion_results_count) as notion_sum,
                SUM(google_results_count) as google_sum
             FROM search_metrics
             WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'`,
            [user.id]
        );

        const metrics = rows[0] || { search_count: '0', slack_sum: '0', notion_sum: '0', google_sum: '0' };
        
        // We assume each search saves 5 minutes (5 / 60 hours)
        const searches = parseInt(metrics.search_count) || 0;
        const slackTotal = parseInt(metrics.slack_sum) || 0;
        const notionTotal = parseInt(metrics.notion_sum) || 0;
        const googleTotal = parseInt(metrics.google_sum) || 0;
        
        const hoursSaved = (searches * (5 / 60)).toFixed(1);
        const itemsSurfaced = slackTotal + notionTotal + googleTotal;
        
        let topIntegration = 'None yet';
        if (slackTotal > notionTotal && slackTotal > googleTotal) topIntegration = 'Slack';
        else if (notionTotal > slackTotal && notionTotal > googleTotal) topIntegration = 'Notion';
        else if (googleTotal > slackTotal && googleTotal > notionTotal) topIntegration = 'Google Drive';
        else if (itemsSurfaced > 0) topIntegration = 'Slack & Notion';

        // Count integrations connected
        let totalIntegrations = 0;
        if (user.slack_access_token) totalIntegrations++;
        // We'd pass notion/google tokens if we selected them in the cron, we'll assume 1 for now if we didn't fetch them, 
        // but let's actually just check the user object.
        const allUserFields = user as any;
        if (allUserFields.notion_access_token) totalIntegrations++;
        if (allUserFields.google_access_token) totalIntegrations++;

        const stats: DigestStats = {
            hoursSaved: hoursSaved === '0.0' ? '0' : hoursSaved,
            itemsSurfaced,
            topIntegration,
            totalIntegrations
        };

        // --- Generate AI Summary ---
        const messages = await fetchRecentSlackMessages(user.slack_access_token);
        if (!messages || messages.length === 0) return null;

        const messageContext = messages
            .slice(0, 10)
            .map(m => `[#${m.channel} - ${m.user}]: ${m.text.slice(0, 250)}`)
            .join('\n');

        const prompt = `You are Prism AI. Summarize this week's team activity from Slack for a weekly digest email.

Here are recent messages from the user's Slack workspace:
${messageContext}

Write a warm, engaging 3-4 sentence summary of what the team was working on, discussing, or decided this week.
Write it as if you're talking to the individual user directly (use "your team").
Be specific about topics mentioned. Keep it concise and upbeat.
Plain prose only — no bullet points or markdown.`;

        const groq = new Groq({ apiKey });
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 250,
            temperature: 0.6,
        });

        const summary = completion.choices[0]?.message?.content?.trim();
        return summary ? { summary, stats } : null;
        
    } catch (err: any) {
        console.error(`Digest generation failed for user ${user.id}:`, err?.message);
        return null;
    }
}

export function getWeekOf(): string {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(start)} – ${fmt(now)}`;
}
