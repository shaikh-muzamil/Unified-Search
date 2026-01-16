import { WebClient } from '@slack/web-api';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkAuth() {
    console.log('--- Checking API Credential Validity ---\n');

    // 1. Check Slack
    const slackToken = process.env.SLACK_USER_TOKEN;
    console.log(`Slack Token Found: ${slackToken ? 'Yes' : 'No'} (${slackToken?.substring(0, 5)}...)`);

    if (slackToken) {
        const slack = new WebClient(slackToken);
        try {
            const auth = await slack.auth.test();
            console.log(`✅ Slack Auth Success: User=${auth.user} Team=${auth.team}`);

            // Try Search
            console.log('   Attempting Slack Search...');
            const search = await slack.search.messages({ query: 'test', count: 1 });
            console.log(`   ✅ Slack Search Output: Found ${search.messages?.total} messages.`);
        } catch (error: any) {
            console.error(`❌ Slack Error: ${error.data?.error || error.message}`);
            if (error.data?.error === 'missing_scope') {
                console.error('      👉 MISSING SCOPE: You need "search:read" in your User Token scopes.');
            }
        }
    } else {
        console.error('❌ Slack Token missing in .env');
    }

    console.log('\n----------------------------------------\n');

    // 2. Check Notion
    const notionKey = process.env.NOTION_API_KEY;
    console.log(`Notion Key Found: ${notionKey ? 'Yes' : 'No'} (${notionKey?.substring(0, 5)}...)`);

    if (notionKey) {
        const notion = new Client({ auth: notionKey });
        try {
            const user = await notion.users.me({});
            console.log(`✅ Notion Auth Success: Bot User=${user.name}`);

            // Try Search
            console.log('   Attempting Notion Search...');
            const search = await notion.search({ query: 'test', page_size: 1 });
            console.log(`   ✅ Notion Search Output: Found ${search.results.length} results.`);
            if (search.results.length === 0) {
                console.warn('      ⚠️ Notion Warning: 0 results found. Have you connected this integration to any pages?');
            }
        } catch (error: any) {
            console.error(`❌ Notion Error: ${error.code} - ${error.message}`);
        }
    } else {
        console.error('❌ Notion Key missing in .env');
    }
}

checkAuth();
