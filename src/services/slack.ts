import { WebClient } from '@slack/web-api';

export interface SlackResult {
    type: 'message' | 'file';
    text: string;
    user: string;
    channel: string;
    ts: string;
    permalink: string;
}

const getClient = (accessToken?: string) => {
    const token = accessToken || process.env.SLACK_USER_TOKEN;
    if (!token) return null;
    return new WebClient(token);
};

export const searchSlack = async (query: string, accessToken?: string): Promise<SlackResult[]> => {
    const client = getClient(accessToken);
    if (!client) {
        console.warn('Slack Access Token is not available for this user.');
        return [];
    }

    try {
        const result = await client.search.messages({
            query: query,
            count: 10,
            sort: 'timestamp',
            sort_dir: 'desc'
        });

        if (!result.messages || !result.messages.matches) {
            return [];
        }

        return result.messages.matches.map((match: any) => ({
            type: 'message',
            text: match.text,
            user: match.username || match.user,
            channel: match.channel ? match.channel.name : 'unknown',
            ts: match.ts,
            permalink: match.permalink
        }));
    } catch (error) {
        console.error('Error searching Slack:', error);
        return [];
    }
};

export const getRecentMessages = async (accessToken?: string): Promise<SlackResult[]> => {
    // Since we might not have channels:history scope, we can cheat and search for "*"
    // sorted by timestamp to get "recent" messages across all accessible channels.
    return searchSlack('*', accessToken);
};
