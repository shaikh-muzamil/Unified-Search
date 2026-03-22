const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'public', 'style.css');
const landingPath = path.join(__dirname, 'src', 'views', 'landing.ejs');
const indexPath = path.join(__dirname, 'src', 'views', 'index.ejs');
const accountPath = path.join(__dirname, 'src', 'views', 'account.ejs');

const mappings = {
    'var(--bg-base)': 'var(--bg-app)',
    'var(--bg-elevated)': 'var(--bg-card)',
    'var(--bg-overlay)': 'var(--bg-card-glass)',
    'var(--text-primary)': 'var(--text-1)',
    'var(--text-secondary)': 'var(--text-2)',
    'var(--text-muted)': 'var(--text-3)',
    'var(--coral-bright)': 'var(--primary)',
    'var(--coral-dark)': 'var(--primary-h)',
    'var(--cyan-bright)': 'var(--accent)',
    'var(--cyan-dark)': 'var(--accent-dim)',
    'var(--border-subtle)': 'var(--border)',
    'var(--border-highlight)': 'var(--border-focus)',
    'var(--border-accent)': 'var(--primary)',
    'var(--radius-sm)': 'var(--r-sm)',
    'var(--radius-md)': 'var(--r-md)',
    'var(--radius-lg)': 'var(--r-lg)',
    'var(--radius-pill)': 'var(--r-pill)'
};

function refactorFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [oldVar, newVar] of Object.entries(mappings)) {
        content = content.split(oldVar).join(newVar);
    }
    
    // Replace hex codes in landing.ejs matching old integrations
    if (filePath.includes('landing.ejs')) {
        content = content.replace(/color: #E22B58;/g, 'color: var(--slack);');
        content = content.replace(/background: rgba\(55, 48, 163, 0.3\);/g, 'background: rgba(74, 21, 75, 0.15);'); // Slack new
        content = content.replace(/rgba\(255, 77, 77, [^)]+\)/g, 'rgba(124, 58, 237, 0.3)'); // old coral glow to purple glow
    } else if (filePath.includes('style.css')) {
        content = content.replace(/rgba\(255, 77, 77,/g, 'rgba(124, 58, 237,'); 
        content = content.replace(/rgba\(0, 229, 204,/g, 'rgba(167, 139, 250,'); 
        content = content.replace(/#FFA800/g, 'var(--accent)'); 
        // Force the root replacing
        const rootReplacement = `
:root {
  /* backgrounds */
  --bg-app:       #0f0a1e;
  --bg-sidebar:   #1a1040;
  --bg-card:      #130d2a;
  --bg-card-glass: rgba(19, 13, 42, 0.75);
  --bg-input:     #1e1b4b;
  --bg-hover:     #2d1b69;
  --bg-selected:  #312e81;

  /* brand */
  --primary:      #7c3aed;
  --primary-h:    #6d28d9;
  --accent:       #a78bfa;
  --accent-dim:   #c4b5fd;

  /* text */
  --text-1:       #ffffff;
  --text-2:       #c4b5fd;
  --text-3:       #9ca3af;
  --text-ph:      #6b7280;

  /* borders */
  --border:       #374151;
  --border-focus: #7c3aed;

  /* semantic */
  --success:      #22c55e;
  --warning:      #f59e0b;
  --danger:       #ef4444;
  --info:         #06b6d4;
  --ai:           #f472b6;

  /* radii */
  --r-sm:  6px;
  --r-md:  10px;
  --r-lg:  16px;
  --r-pill: 999px;

  /* Shadows (Rebuilt for new brand) */
  --shadow-soft: 0 4px 20px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 20px rgba(124, 58, 237, 0.2);
  --shadow-glow-hover: 0 0 30px rgba(124, 58, 237, 0.4);
  
  --font-heading: 'Outfit', sans-serif;
  --font-body: 'Inter', sans-serif;
  
  /* Integrations */
  --slack: #4a154b;
  --notion: #ffffff;
}

[data-theme="light"] {
  --bg-app:       #ede9fe;
  --bg-card:      #ffffff;
  --bg-card-glass: rgba(255, 255, 255, 0.85);
  --bg-input:     #f5f3ff;
  --border:       #ddd6fe;
  --border-focus: #7c3aed;
  
  --text-1:       #0f172a;
  --text-2:       #4c1d95;
  --text-3:       #6d28d9;
  
  --shadow-soft: 0 8px 30px rgba(0, 0, 0, 0.05);
}
`;
        content = content.replace(/:root\s*{[^}]*}[\s\S]*?\[data-theme="light"\]\s*{[^}]*}/m, rootReplacement.trim());
        
        // Fix badges
        content = content.replace(/\.badge-slack\s*{[^}]*}/, '.badge-slack { background: rgba(74, 21, 75, 0.15); color: #fff; border: 1px solid #4a154b; }');
        content = content.replace(/\.badge-notion\s*{[^}]*}/, '.badge-notion { background: rgba(255, 255, 255, 0.15); color: #fff; border: 1px solid #ffffff; }');
    }
    
    fs.writeFileSync(filePath, content);
    console.log('Refactored:', filePath);
}

[cssPath, landingPath, indexPath, accountPath].forEach(refactorFile);
