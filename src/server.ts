import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import bcrypt from 'bcrypt';
import connectPgSimple from 'connect-pg-simple';
import { initDB, pool } from './database';
import { searchSlack, getRecentMessages } from './services/slack';
import { searchNotion } from './services/notion';
import axios from 'axios';

// Explicitly load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PgSession = connectPgSimple(session);
const app = express();
const PORT = process.env.PORT || 3000;

// Required for Vercel/Heroku to trust the proxy and allow secure cookies
app.set('trust proxy', 1);

// Initialize DB (Schema check)
// In serverless, we might skip this or check on every req, but for now init on startup is okay for local dev
// For vercel, the 'initDB' might behave differently or be part of a build step/migration,
// but calling it here ensures tables exist if the container starts cold.
initDB().catch(console.error);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Setup
app.use(session({
    store: new PgSession({
        pool: pool,
        tableName: 'session'
    }),
    secret: 'super-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        secure: false // process.env.NODE_ENV === 'production' // Temporarily disable for debugging
    }
}));



// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Auth Middleware
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if ((req.session as any).userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// --- Routes ---

app.get('/debug', async (req, res) => {
    try {
        const dbRes = await pool.query('SELECT NOW()');
        res.json({
            status: 'online',
            db_time: dbRes.rows[0].now,
            env: {
                NODE_ENV: process.env.NODE_ENV,
                HAS_DB_URL: !!process.env.DATABASE_URL,
                HAS_POSTGRES_URL: !!process.env.POSTGRES_URL,
                DB_URL_START: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 10) : 'N/A',
                SLACK_CLIENT_ID: !!process.env.SLACK_CLIENT_ID,
                SLACK_REDIRECT_URI: process.env.SLACK_REDIRECT_URI
            }
        });
    } catch (e: any) {
        res.status(500).json({
            status: 'error',
            error: e.message,
            env: {
                NODE_ENV: process.env.NODE_ENV,
                HAS_DB_URL: !!process.env.DATABASE_URL,
                HAS_POSTGRES_URL: !!process.env.POSTGRES_URL
            }
        });
    }
});

// Landing Page
app.get('/', requireAuth, async (req, res) => {
    const user = (req.session as any).user;
    let recentSlackMessages = null;

    if (user.slack_access_token) {
        try {
            recentSlackMessages = await getRecentMessages(user.slack_access_token);
        } catch (e) {
            console.error('Error fetching recent slack messages', e);
        }
    }

    res.render('index', {
        user: user,
        results: null,
        query: '',
        recents: recentSlackMessages
    });
});

// Search Route
app.get('/search', requireAuth, async (req, res) => {
    const query = req.query.q as string;
    const user = (req.session as any).user;

    if (!query) return res.render('index', { user, results: null, query: '' });

    try {
        const [slackResults, notionResults] = await Promise.all([
            searchSlack(query, user.slack_access_token),
            searchNotion(query, user.notion_access_token)
        ]);
        res.render('index', { user, results: { slack: slackResults, notion: notionResults }, query });
    } catch (error) {
        console.error("Search failed:", error);
        res.render('index', { user, results: null, error: "Search failed.", query });
    }
});

// Auth Routes
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            (req.session as any).userId = user.id;
            (req.session as any).user = user;

            // Explicitly save session before redirecting to ensure it's written to DB
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.render('login', { error: 'Error saving session. Check logs.' });
                }
                res.redirect('/');
            });
        } else {
            res.render('login', { error: 'Invalid email or password' });
        }
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'Login error' });
    }
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
            [name, email, hashedPassword]
        );
        res.redirect('/login');
    } catch (error: any) {
        console.error(error);
        // creating a specific message for users but keeping the detailed error for debugging if needed
        res.render('signup', { error: `Error: ${error.message}` });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

// --- OAuth Routes ---

// Slack OAuth
app.get('/auth/slack', (req, res) => {
    const scopes = 'search:read'; // Add other scopes as needed
    const redirectUri = (process.env.SLACK_REDIRECT_URI || '').trim();
    const clientId = (process.env.SLACK_CLIENT_ID || '').trim();

    if (!clientId || !redirectUri) {
        return res.status(500).send('Slack App Credentials not configured.');
    }

    const url = `https://slack.com/oauth/v2/authorize?client_id=${encodeURIComponent(clientId)}&user_scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.redirect(url);
});

app.get('/auth/slack/callback', async (req, res) => {
    const { code } = req.query;
    const userId = (req.session as any).userId;

    if (!code) return res.status(400).send('No code received');
    if (!userId) return res.redirect('/login');

    try {
        const response = await axios.post('https://slack.com/api/oauth.v2.access', null, {
            params: {
                client_id: process.env.SLACK_CLIENT_ID,
                client_secret: process.env.SLACK_CLIENT_SECRET,
                code: code,
                redirect_uri: process.env.SLACK_REDIRECT_URI
            }
        });

        if (response.data.ok) {
            const accessToken = response.data.authed_user.access_token;
            const slackUserId = response.data.authed_user.id;

            await pool.query(
                'UPDATE users SET slack_access_token = $1, slack_user_id = $2 WHERE id = $3',
                [accessToken, slackUserId, userId]
            );

            // Update session user object
            const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
            (req.session as any).user = userResult.rows[0];

            res.redirect('/account');
        } else {
            console.error('Slack OAuth Error:', response.data);
            res.status(500).send(`Slack Auth Failed: ${response.data.error}`);
        }
    } catch (error) {
        console.error('Slack OAuth Exception:', error);
        res.status(500).send('Internal Server Error during Slack Auth');
    }
});

// Notion OAuth
app.get('/auth/notion', (req, res) => {
    const clientId = (process.env.NOTION_CLIENT_ID || '').trim();
    const redirectUri = (process.env.NOTION_REDIRECT_URI || '').trim();

    if (!clientId || !redirectUri) {
        return res.status(500).send('Notion App Credentials not configured.');
    }

    // Notion uses Basic Auth for token endpoint but authorization URL is standard
    const url = `https://api.notion.com/v1/oauth/authorize?client_id=${encodeURIComponent(clientId)}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.redirect(url);
});

app.get('/auth/notion/callback', async (req, res) => {
    const { code } = req.query;
    const userId = (req.session as any).userId;

    if (!code) return res.status(400).send('No code received');
    if (!userId) return res.redirect('/login');

    try {
        const clientId = (process.env.NOTION_CLIENT_ID || '').trim();
        const clientSecret = (process.env.NOTION_CLIENT_SECRET || '').trim();
        const redirectUri = (process.env.NOTION_REDIRECT_URI || '').trim();

        // Notion requires Basic Auth header
        const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        const response = await axios.post('https://api.notion.com/v1/oauth/token', {
            grant_type: 'authorization_code',
            code: code as string,
            redirect_uri: redirectUri
        }, {
            headers: {
                'Authorization': `Basic ${encoded}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.access_token) {
            const accessToken = response.data.access_token;
            const botId = response.data.bot_id;

            await pool.query(
                'UPDATE users SET notion_access_token = $1, notion_bot_id = $2 WHERE id = $3',
                [accessToken, botId, userId]
            );

            // Update session user object
            const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
            (req.session as any).user = userResult.rows[0];

            res.redirect('/account');
        } else {
            console.error('Notion OAuth Error:', response.data);
            res.status(500).send('Notion Auth Failed');
        }
    } catch (error: any) {
        console.error('Notion OAuth Exception:', error.response ? error.response.data : error.message);
        res.status(500).send('Internal Server Error during Notion Auth');
    }
});

// Pages
app.get('/account', requireAuth, (req, res) => {
    // Check tokens from the user object in session
    // (Ensure session user is up to date or fetch fresh?)
    // For now, trust session, but ideally fetch fresh.
    const user = (req.session as any).user;

    res.render('account', {
        user: user,
        slackConnected: !!user.slack_access_token,
        notionConnected: !!user.notion_access_token
    });
});

app.get('/sync', requireAuth, (req, res) => {
    res.render('sync', { user: (req.session as any).user });
});



// Export app for Vercel
export default app;

app.get('/auth/debug-links', (req, res) => {
    const slackClientId = (process.env.SLACK_CLIENT_ID || '').trim() || 'MISSING';
    const slackRedirect = (process.env.SLACK_REDIRECT_URI || '').trim() || 'MISSING';
    const slackUrl = `https://slack.com/oauth/v2/authorize?client_id=${encodeURIComponent(slackClientId)}&user_scope=search:read&redirect_uri=${encodeURIComponent(slackRedirect)}`;

    const notionClientId = (process.env.NOTION_CLIENT_ID || '').trim() || 'MISSING';
    const notionRedirect = (process.env.NOTION_REDIRECT_URI || '').trim() || 'MISSING';
    const notionUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${encodeURIComponent(notionClientId)}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(notionRedirect)}`;

    res.send(`
        <html>
            <body style="font-family: sans-serif; padding: 2rem;">
                <h1>OAuth Debug Links</h1>
                <p>Use these links to verify exactly what is being sent to the providers.</p>
                
                <hr/>
                <h3>Slack</h3>
                <p><strong>Client ID:</strong> ${slackClientId}</p>
                <p><strong>Redirect URI:</strong> ${slackRedirect}</p>
                <p><strong>Generated URL:</strong> <div style="background: #eee; padding: 10px; word-break: break-all;">${slackUrl}</div></p>
                <a href="${slackUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; display: inline-block;">Test Slack Link</a>

                <hr/>
                <h3>Notion</h3>
                <p><strong>Client ID:</strong> ${notionClientId}</p>
                <p><strong>Redirect URI:</strong> ${notionRedirect}</p>
                <p><strong>Generated URL:</strong> <div style="background: #eee; padding: 10px; word-break: break-all;">${notionUrl}</div></p>
                <a href="${notionUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; display: inline-block;">Test Notion Link</a>
            </body>
        </html>
    `);
});




// Only listen if not running in serverless (local dev)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
