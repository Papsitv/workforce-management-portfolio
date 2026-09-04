Deploying the backend (summary)

This repo includes Vercel-compatible serverless endpoints under `/api` that:

- POST `/api/requestMeeting` — accepts JSON { name, email, phone, datetime, message, action } and:
  - Sends an immediate notification email to the site owner (`OWNER_EMAIL`) when `action: 'meeting'`.
  - Sends a verification email to the user's `email` containing a confirmation link (signed JWT). For `action: 'resume'` the link redirects to `resume.pdf` after verification.

- GET `/api/confirm?token=...` — verifies the JWT and redirects to `/resume.pdf` (for `action: 'resume'`) or shows a confirmation message.

Required environment variables (set in Vercel, Render, or your host):

- `SENDGRID_API_KEY` — SendGrid API key used to send emails.
- `OWNER_EMAIL` — recipient address for owner notifications (default: lealdennis110@gmail.com).
- `SITE_URL` — full URL where the site is hosted (e.g. https://yourdomain.com). Used to build confirmation links.
- `JWT_SECRET` — random secret string for signing verification tokens.

Quick deploy (Vercel)

1. Install Vercel CLI and log in:

```bash
npm i -g vercel
vercel login
```

2. From the repo root, run:

```bash
vercel
```

3. In the Vercel dashboard, set the env vars listed above for the Production deployment.

4. Use `vercel --prod` to deploy the production site.

Alternative: deploy non-interactively using a Personal Token

1. Create a Personal Token in Vercel: https://vercel.com/account/tokens
2. From the repo root run (replace <TOKEN> with your token):

```bash
VERCEL_TOKEN=<TOKEN> vercel --prod --confirm
```

This environment variable allows automation without interactive login. The first deploy will create a project in your Vercel account — set the required environment variables (`SENDGRID_API_KEY`, `OWNER_EMAIL`, `SITE_URL`, `JWT_SECRET`) in the Vercel project settings after deployment.

I added `vercel.json` and `.vercelignore` to this repo to make the functions deployable; commit and push these files before deploying.

Notes
- This code requires a SendGrid account (or modify to use another email provider). You are responsible for providing the API key.
- Tokens expire after 24 hours.
- For security, change the default `JWT_SECRET` immediately when deploying.
 - If you do not provide a `SENDGRID_API_KEY`, the endpoints will run in fallback mode: they will log incoming requests (visible in function logs) and allow direct resume download without email verification. Owner notification via email will be skipped in fallback mode.
