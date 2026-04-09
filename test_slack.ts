import { searchSlack } from './src/services/slack';
import { pool } from './src/database';

async function run() {
    try {
        const { rows } = await pool.query('SELECT email, slack_access_token FROM users WHERE slack_access_token IS NOT NULL LIMIT 1');
        if (rows.length === 0) {
            console.log('No user with a Slack token found.');
            process.exit(0);
        }

        const user = rows[0];
        console.log(`Testing with user: ${user.email}`);
        
        const q = 'the';
        console.log(`Searching for: "${q}"...`);
        const results = await searchSlack(q, user.slack_access_token);
        
        console.log(`Found ${results.length} messages.`);
        if (results.length > 0) {
            console.log(results[0]);
        } else {
            console.log('No results for "the". Let me try a wildcard "*"');
            const wResults = await searchSlack('*', user.slack_access_token);
            console.log(`Found ${wResults.length} messages for wildcard.`);
        }
        
    } catch (e: any) {
        console.error('Test failed:', e.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

run();
