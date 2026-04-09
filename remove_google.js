const fs = require('fs');

// 1. UPDATE SERVER.TS
let server = fs.readFileSync('src/server.ts', 'utf-8');

// Replace the search logic block to remove Google queries
server = server.replace(/const \[slackResults, notionResults, googleDriveResults, gmailResults\] = await Promise.all\(\[[\s\S]*?user.google_access_token \? searchGmail\(query, user.google_access_token\) : Promise.resolve\(\[\]\)[\s\S]*?\]\);/g, `const [slackResults, notionResults] = await Promise.all([
            searchSlack(query, user.slack_access_token),
            searchNotion(query, user.notion_access_token)
        ]);`);

server = server.replace(/results: \{[\s\S]*?slack: slackResults,[\s\S]*?notion: notionResults,[\s\S]*?googleDrive: googleDriveResults,[\s\S]*?gmail: gmailResults[\s\S]*?\}/g, `results: {
                slack: slackResults,
                notion: notionResults
            }`);

fs.writeFileSync('src/server.ts', server);

// 2. UPDATE INDEX.EJS
let index = fs.readFileSync('src/views/index.ejs', 'utf-8');

// Remove Google Drive Column
index = index.replace(/<!-- Google Drive Column -->[\s\S]*?<!-- Gmail Column -->/, '<!-- Gmail Column -->');

// Remove Gmail Column safely
// Match from <!-- Gmail Column --> to the end of its div, stopping before the closing </div> of results-grid
index = index.replace(/<!-- Gmail Column -->[\s\S]*?<\/div>\s*<\/div>\s*<%\s*\} else if\s*\(typeof recents !=='undefined'/, "</div>\n                <% } else if (typeof recents !=='undefined'");

fs.writeFileSync('src/views/index.ejs', index);

console.log('Google Workspace results removed from backend and frontend!');
