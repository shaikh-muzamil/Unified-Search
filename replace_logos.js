const fs = require('fs');

const slackSVG = '<svg width="24" height="24" viewBox="0 0 24 24" fill="var(--slack)"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.523 2.527 2.527 0 0 1 2.521 2.523v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.523-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/></svg>';
const notionSVG = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4.459 4.208c.745-.186 1.118-.558 1.118-1.118V1.6H2.04v1.49c0 .56.373.932 1.118 1.118.56.111.932.373.932.932v12.288c0 .56-.372.932-.932 1.118-.745.186-1.118.56-1.118 1.118v1.49h7.45v-1.49c0-.558-.372-.932-1.118-1.118-.56-.186-.932-.558-.932-1.118V6.816l8.94 11.73h2.61V6.257c0-.56.372-.932 1.117-1.118.746-.186 1.118-.558 1.118-1.118V2.53h-7.078v1.49c0 .56.373.932 1.118 1.118.56.186.932.558.932 1.118v10.424L6.694 4.58H4.46v-.372z"/></svg>';

// 1. UPDATE INDEX.EJS
let index = fs.readFileSync('src/views/index.ejs', 'utf-8');
index = index.replace(/<span style="font-size: 1.5rem;">💬<\/span>/, '<span style="display: flex; align-items: center;">' + slackSVG + '</span>');
index = index.replace(/<span style="font-size: 1.5rem;">🕒<\/span>/, '<span style="display: flex; align-items: center;">' + slackSVG + '</span>'); // For recents
index = index.replace(/<span style="font-size: 1.5rem;">📝<\/span>/, '<span style="display: flex; align-items: center;">' + notionSVG + '</span>');
// Replace standard Notion document page icon with standard file icon, or keep as is.
fs.writeFileSync('src/views/index.ejs', index);

// 2. UPDATE LANDING.EJS
let landing = fs.readFileSync('src/views/landing.ejs', 'utf-8');
landing = landing.replace(/<span style="color: var\(--slack\);">#<\/span>/, slackSVG + ' ');
landing = landing.replace(/<span>📝<\/span>/, notionSVG + ' ');

// Clean up references to Gmail and Google Drive from the branding copy
landing = landing.replace(/<span class="integration-pill">\s*<span style="color: #EA4335;">Gmail<\/span>\s*<\/span>/, '');
landing = landing.replace(/<span class="integration-pill">\s*<span style="color: #0F9D58;">Drive<\/span>\s*<\/span>/, '');
landing = landing.replace(/, Gmail, GitHub/g, ''); // Ensure copy is updated
fs.writeFileSync('src/views/landing.ejs', landing);

console.log("Logos updated and dead weight nuked!");
