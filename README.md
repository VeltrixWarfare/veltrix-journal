# VELTRIX JOURNAL
**Discipline Over Emotion.** A personal Forex + Crypto trading journal built with React, Vite, Supabase, and Vercel.

## Included
- Supabase email/password authentication
- User-isolated database with Row Level Security
- Multiple trading accounts
- Trade log with manual entry and chart screenshot upload
- Dashboard: realized net P/L, win rate, trade count, profit factor, average R:R, max drawdown, equity curve
- Forex / Crypto filters
- Trading calendar
- Strategy and market analytics
- Psychology and trading-plan compliance tracking
- Generic risk calculator
- Prop-firm challenge tracker
- CSV and PDF export
- Optional AI performance review via Supabase Edge Function

## 1. Create Supabase project
Create a Supabase project, then open **SQL Editor** and run the complete file:
`supabase/migrations/202611080001_veltrix_journal.sql`

This creates the tables, RLS policies, and screenshot storage bucket.

## 2. Configure local environment
Copy `.env.example` to `.env` and fill:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Use the Supabase **anon / publishable key** only in the browser. Never put the service-role key in Vite or GitHub.

## 3. Run locally
```bash
npm install
npm run dev
```

## 4. Deploy to GitHub + Vercel
1. Upload the project files to a new GitHub repository named `veltrix-journal`.
2. Import that repository in Vercel.
3. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel Project Settings → Environment Variables.
5. Redeploy.

`vercel.json` includes SPA routing fallback.

## 5. Enable AI Review (optional)
The app's AI Review page calls a Supabase Edge Function named `ai-review`.
Deploy it:
```bash
supabase functions deploy ai-review
```
Set secrets on the Supabase project:
```bash
supabase secrets set AI_API_KEY=YOUR_PROVIDER_KEY
supabase secrets set AI_API_URL=https://generativelanguage.googleapis.com/v1beta/openai/chat/completions
supabase secrets set AI_MODEL=gemini-2.0-flash
```
The AI function uses an OpenAI-compatible chat-completions endpoint. Choose a provider/model that supports this API format. Do not expose provider keys in frontend environment variables.

## Important calculation notes
- Net P/L is entered by the user; the app does not infer contract-specific Forex pip values or crypto exchange fees.
- Profit factor uses positive and negative `net_pnl` values from closed trades.
- Win rate counts closed trades with net P/L > 0 as wins; zero P/L is break-even.
- Equity curve and max drawdown are based on the sequence of closed-trade net P/L values, not broker account balance history or open floating P/L.
- The risk calculator is a generic estimate. It does not know every broker's contract size, tick value, pip value, or commission schedule.
- Prop challenge records are tracking fields; they do not connect to or verify a prop firm's account.

## Security
- RLS policies scope each user's records to `auth.uid()`.
- Use only the Supabase anon/publishable key in the browser.
- Keep AI provider keys as Supabase Edge Function secrets.
- Screenshot uploads are limited to image MIME types and 5 MB in the SQL bucket configuration.
