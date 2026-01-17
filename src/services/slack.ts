import { WebClient } from '@slack/web-api';

export interface SlackResult {
    type: 'message' | 'file';
    text: string;
    user: string;
    channel: string;
    ts: string;
    permalink: string;
}

export const searchSlack = async (query: string, accessToken?: string): Promise<SlackResult[]> => {
    // Use provided token or fallback to env (optional, or just enforce provided token)
    const token = accessToken || process.env.SLACK_USER_TOKEN;

    if (!token) {
        console.warn('Slack Access Token is not available for this user.');
        return [];
    }

    // Initialize client with the specific token
    const slackClient = new WebClient(token);

    console.log('Slack Token Prefix:', token.substring(0, 5));

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
