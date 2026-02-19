import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export const getGoogleAuthUrl = () => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline', // Critical for getting refresh token
        scope: SCOPES,
        prompt: 'consent' // Force consent to ensure refresh token is returned
    });
};

export const getGoogleTokens = async (code: string) => {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};

export const searchGoogleDrive = async (query: string, accessToken: string) => {
    try {
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const drive = google.drive({ version: 'v3', auth });

        // Search for files with name containing query, not trashed
        const response = await drive.files.list({
            q: `name contains '${query}' and trashed = false`,
            fields: 'files(id, name, webViewLink, iconLink, mimeType)',
            pageSize: 10
        });

        return (response.data.files || []).map(file => ({
            type: 'Google Drive',
            title: file.name || 'Untitled',
            url: file.webViewLink || '#',
            icon: file.iconLink || 'https://ssl.gstatic.com/docs/doclist/images/icon_10_generic_list.png' // Fallback icon
        }));

    } catch (error) {
        console.error('Error searching Google Drive:', error);
        return [];
    }
};
