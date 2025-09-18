# Telegram InferenceBot

A Telegram bot that queries a serverless inference API with a chosen LLM, similar to the Discord version but adapted for Telegram's platform.

## Prerequisites

- Node.js 18+
- Telegram Bot Token from [@BotFather](https://t.me/botfather)
- LLM API credentials (same as the Discord version)

## Setup

1. **Install dependencies**
   ```bash
   cd telegram
   npm install
   ```

2. **Configure environment**
   Copy the parent directory's `.env` file or create a new one with these variables:
   ```
   # Required
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   LLM_API_KEY=your-llm-api-key
   LLM_API_BASE=https://api.your-inference-platform.com/v1
   
   # Optional
   LLM_DEFAULT_MODEL=asi1-mini
   ADMIN_IDS=123456789,987654321  # Comma-separated list of admin user IDs
   NODE_ENV=development  # Set to 'production' in production
   ```

3. **Start the bot**
   ```bash
   npm start
   ```
   For development with auto-restart:
   ```bash
   npm run dev
   ```

## Usage

### Commands
- `/start` - Welcome message and basic instructions
- `/help` - Show help information
- `/ask [question]` - Ask a question to the AI
- `/model` - Change the AI model

### Direct Messages
You can also send messages directly to the bot without using commands, and it will respond using the default model.

## Features

- Multiple model support with easy switching
- Conversation history per user
- Admin-only commands (if ADMIN_IDS is set)
- Markdown formatting in responses
- Error handling and logging

## Deployment

### Heroku
1. Create a new Heroku app
2. Set the config vars in the Heroku dashboard
3. Deploy your code

### Vercel/Serverless
This bot can be deployed to serverless environments with minimal changes to use webhooks instead of polling.

## Notes

- The bot requires the same LLM API as the Discord version
- Conversation history is stored in memory and will be lost on restart
- For production use, consider adding rate limiting and persistent storage
