document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  
  // Base URL for the Prism web app. 
  // Change to your production Vercel URL when deploying, e.g. "https://your-app.vercel.app"
  const BASE_URL = "http://localhost:3000";

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    
    if (query) {
      // Open a new tab in Chrome with the search query
      chrome.tabs.create({
        url: `${BASE_URL}/search?q=${encodeURIComponent(query)}`
      });
    }
  });

  // Highlight Demo Section on Hover
  const demoCards = document.querySelectorAll('.demo-card');
  demoCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.background = 'rgba(255, 255, 255, 0.08)';
      card.style.transform = 'translateX(4px)';
      card.style.transition = 'all 0.2s';
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = 'rgba(255, 255, 255, 0.03)';
      card.style.transform = 'translateX(0)';
    });
  });
});
