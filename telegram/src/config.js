const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the parent directory's .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

function getEnv(name, fallback) {
  const value = process.env[name];
  if (value && value.trim().length > 0) return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required environment variable: ${name}`);
}

module.exports = {
  telegramToken: () => getEnv('TELEGRAM_BOT_TOKEN'),
  llmApiKey: () => getEnv('LLM_API_KEY'),
  llmApiBase: () => getEnv('LLM_API_BASE'),
  llmDefaultModel: () => getEnv('LLM_DEFAULT_MODEL', 'asi1-mini'),
  adminIds: () => (getEnv('ADMIN_IDS', '').split(',').map(id => id.trim()).filter(Boolean) || []).map(Number),
  isProduction: () => process.env.NODE_ENV === 'production',
};
