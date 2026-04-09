---
description: Deploy to Vercel and test each feature after implementation
---

# Prism — Deploy & Test on Vercel

After every feature is implemented and pushed to GitHub, always follow these steps to test on Vercel before considering the feature done.

## Steps

1. **Push code to GitHub**
   - Commit all changed files with a descriptive message
   - Push to `main` branch → `git push origin main`
   - Vercel auto-deploys from GitHub (usually takes ~1-2 min)

2. **Add any new environment variables to Vercel**
   - Go to: https://vercel.com/shaikh-muzamil/prism/settings/environment-variables
   - Add any new keys needed (e.g. `GROQ_API_KEY`)
   - Select all environments: Production, Preview, Development
   - Click Save
   - If env vars were added → **manually trigger a redeploy** (step 3)

3. **Trigger redeploy (if needed)**
   - Go to: https://vercel.com/shaikh-muzamil/prism/deployments
   - Click ⋯ on the latest deployment → Redeploy
   - Wait ~1 min for deployment to go live

4. **Test on the live Vercel URL**
   - Visit the production URL and test the feature end-to-end
   - Confirm the feature works exactly as it does locally

5. **Report back**
   - Confirm to the user: "Feature is live and tested on Vercel ✅"
   - Include the Vercel URL for the user to verify themselves

## Notes
- `.env` is in `.gitignore` — secrets are NEVER pushed to GitHub
- Always add new secrets to Vercel env vars manually
- Vercel project: https://vercel.com/shaikh-muzamil/prism
- GitHub repo: https://github.com/shaikh-muzamil/Prism
