import { Client } from '@notionhq/client';

export interface NotionResult {
    id: string;
    title: string;
    url: string;
    object: string; // 'page' or 'database'
}

export const searchNotion = async (query: string, accessToken?: string): Promise<NotionResult[]> => {
    // Use provided token or fallback to env
    const apiKey = accessToken || process.env.NOTION_API_KEY;

    if (!apiKey) {
        console.warn('Notion API Key is not available for this user.');
        return [];
    }

    // Initialize client with the user's specific token
    const notionClient = new Client({ auth: apiKey });

    try {
        const response = await notionClient.search({
            query: query,
            page_size: 10,
        });

        console.log('Notion Search Response:', JSON.stringify(response, null, 2)); // DEBUG LOG

        return response.results.map((page: any) => {
            let title = 'Untitled';

            // Extract title based on object type and properties structure
            // This is a simplification; Notion title extraction can be complex
            if (page.properties) {
                const titleProp = Object.values(page.properties).find((prop: any) => prop.type === 'title') as any;
                if (titleProp && titleProp.title && titleProp.title.length > 0) {
                    title = titleProp.title.map((t: any) => t.plain_text).join('');
                }
            }

            return {
                id: page.id,
                title: title,
                url: page.url,
                object: page.object
            };
        });
    } catch (error) {
        console.error('Error searching Notion:', error);
        return [];
    }
};
