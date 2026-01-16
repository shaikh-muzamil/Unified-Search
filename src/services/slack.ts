import { WebClient } from '@slack/web-api';

export interface SlackResult {
    type: 'message' | 'file';
    text: string;
    user: string;
    channel: string;
    ts: string;
    permalink: string;
}

export const searchSlack = async (query: string): Promise<SlackResult[]> => {
    // Initialize client here to ensure dotenv has loaded
    const slackClient = new WebClient(process.env.SLACK_USER_TOKEN);

    console.log('Slack Token Prefix:', process.env.SLACK_USER_TOKEN ? process.env.SLACK_USER_TOKEN.substring(0, 5) : 'None');

    if (!process.env.SLACK_USER_TOKEN) {
        console.warn('SLACK_USER_TOKEN is not set.');
        return [];
    }

    try {
        const result = await slackClient.search.messages({
            query: query,
            count: 10,
        });

        console.log('Slack Search Result:', JSON.stringify(result, null, 2)); // DEBUG LOG

        if (!result.messages || !result.messages.matches) {
            console.log('Slack: No matches found in response structure.');
            return [];
        }

        return result.messages.matches.map((match: any) => ({
            type: 'message',
            text: match.text,
            user: match.username || match.user,
            channel: match.channel.name,
            ts: match.ts,
            permalink: match.permalink
        }));
    } catch (error) {
        console.error('Error searching Slack:', error);
        return [];
    }
};
