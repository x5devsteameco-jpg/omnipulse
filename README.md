# AEG Scraper - Social Media Analytics

## Features
- Multi-platform social media analytics (Instagram, Twitter, TikTok, YouTube, LinkedIn, Facebook)
- Real-time metrics tracking and trending analysis
- Marketing gap identification
- Predictive analytics for audience growth

## Setup

```bash
npm install
cp .env.example .env
# Add your API tokens to .env
npm run dev
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| INSTAGRAM_ACCESS_TOKEN | Instagram Graph API token |
| TWITTER_BEARER_TOKEN | Twitter API v2 bearer token |
| TIKTOK_ACCESS_TOKEN | TikTok API access token |
| YOUTUBE_API_KEY | YouTube Data API key |
| LINKEDIN_ACCESS_TOKEN | LinkedIn API access token |
| FACEBOOK_ACCESS_TOKEN | Facebook Graph API token |
