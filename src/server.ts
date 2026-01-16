import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import bcrypt from 'bcrypt';
import connectPgSimple from 'connect-pg-simple';
import { initDB, pool } from './database';
import { searchSlack } from './services/slack';
import { searchNotion } from './services/notion';

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
        secure: process.env.NODE_ENV === 'production' // true in production
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

// Landing Page
app.get('/', requireAuth, (req, res) => {
    res.render('index', { user: (req.session as any).user, results: null, query: '' });
});

// Search Route
app.get('/search', requireAuth, async (req, res) => {
    const query = req.query.q as string;
    const user = (req.session as any).user;

    if (!query) return res.render('index', { user, results: null, query: '' });

    try {
        const [slackResults, notionResults] = await Promise.all([
            searchSlack(query),
            searchNotion(query)
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
            res.redirect('/');
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

// Pages
app.get('/account', requireAuth, (req, res) => {
    res.render('account', {
        user: (req.session as any).user,
        slackConnected: !!process.env.SLACK_USER_TOKEN,
        notionConnected: !!process.env.NOTION_API_KEY
    });
});

app.get('/sync', requireAuth, (req, res) => {
    res.render('sync', { user: (req.session as any).user });
});

// Export app for Vercel
export default app;

app.get('/test-db', async (req, res) => {
    const hasDbUrl = !!process.env.DATABASE_URL;
    const envKeys = Object.keys(process.env).sort();

    // Attempt query even if no URL, just to capture the specific error object
    let dbResult: any = 'Not attempted';
    let errDetail: any = null;

    try {
        const result = await pool.query('SELECT NOW()');
        dbResult = { time: result.rows[0].now };
    } catch (e: any) {
        dbResult = 'FAILED';
        errDetail = { message: e.message, code: e.code, address: e.address, port: e.port };
    }

    res.json({
        status: hasDbUrl ? 'URL_PRESENT' : 'URL_MISSING',
        envKeys: envKeys,
        dbConnection: dbResult,
        error: errDetail
    });
});


// Only listen if not running in serverless (local dev)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
