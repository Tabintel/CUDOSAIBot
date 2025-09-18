const TelegramBot = require('node-telegram-bot-api');
const { generateResponse } = require('./llmClient');
const { 
  telegramToken, 
  llmDefaultModel, 
  adminIds,
  isProduction 
} = require('./config');

// Initialize Telegram Bot
const bot = new TelegramBot(telegramToken(), { 
  polling: true,
  // Only use webhook in production
  ...(isProduction() ? { webHook: { port: process.env.PORT || 3000 } } : {})
});

// Store user conversations
const userSessions = new Map();

// Available models for the bot
const AVAILABLE_MODELS = [
  { id: 'asi1-mini', name: 'Fast Model (asi1-mini)' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'gpt-4', name: 'GPT-4' },
];

// Command handlers
const commands = {
  async start(msg) {
    const chatId = msg.chat.id;
    const welcomeMessage = `👋 Hello! I'm your AI assistant.\n\n` +
      `You can ask me anything, and I'll do my best to help!\n\n` +
      `Available commands:\n` +
      `/ask - Ask me a question\n` +
      `/model - Change the AI model\n` +
      `/help - Show this help message`;
    
    await bot.sendMessage(chatId, welcomeMessage);
  },

  async help(msg) {
    const chatId = msg.chat.id;
    const helpMessage = `🤖 *Bot Commands* \n\n` +
      `/ask - Ask me a question\n` +
      `/model - Change the AI model (current: ${getUserModel(chatId)})\n` +
      `/help - Show this help message\n\n` +
      `Or simply send me a message, and I'll respond!`;
    
    await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  },

  async ask(msg) {
    const chatId = msg.chat.id;
    const prompt = msg.text.replace(/^\/ask\s*/, '').trim();
    
    if (!prompt) {
      return bot.sendMessage(chatId, 'Please provide a question after the /ask command.\nExample: /ask What is the capital of France?');
    }
    
    await handleUserPrompt(chatId, prompt);
  },

  async model(msg) {
    const chatId = msg.chat.id;
    const currentModel = getUserModel(chatId);
    
    const keyboard = {
      inline_keyboard: AVAILABLE_MODELS.map(model => [{
        text: `${model.name} ${model.id === currentModel ? '✅' : ''}`,
        callback_data: `set_model:${model.id}`
      }])
    };
    
    await bot.sendMessage(
      chatId, 
      `*Current model*: ${currentModel}\n\nSelect a model to use:`,
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      }
    );
  }
};

// Helper functions
function getUserSession(chatId) {
  if (!userSessions.has(chatId)) {
    userSessions.set(chatId, {
      model: llmDefaultModel(),
      lastInteraction: Date.now()
    });
  }
  return userSessions.get(chatId);
}

function getUserModel(chatId) {
  return getUserSession(chatId).model;
}

async function handleUserPrompt(chatId, prompt) {
  try {
    const model = getUserModel(chatId);
    const message = await bot.sendMessage(chatId, '🤔 Thinking...');
    
    const response = await generateResponse(prompt, { model });
    
    // Edit the original message with the response
    await bot.editMessageText(response, {
      chat_id: chatId,
      message_id: message.message_id,
      parse_mode: 'Markdown'
    });
    
    // Log the interaction
    console.log(`[${new Date().toISOString()}] User ${chatId} - Model: ${model}\nQ: ${prompt}\nA: ${response.substring(0, 100)}...`);
    
  } catch (error) {
    console.error('Error handling prompt:', error);
    await bot.sendMessage(
      chatId, 
      '❌ Sorry, I encountered an error processing your request. Please try again later.'
    );
  }
}

// Set up command handlers
bot.onText(/^\/start($|\s)/, commands.start);
bot.onText(/^\/help($|\s)/, commands.help);
bot.onText(/^\/ask($|\s)/, commands.ask);
bot.onText(/^\/model($|\s)/, commands.model);

// Handle callback queries (e.g., model selection)
bot.on('callback_query', async (callbackQuery) => {
  const { data, message } = callbackQuery;
  const chatId = message.chat.id;
  
  if (data.startsWith('set_model:')) {
    const modelId = data.split(':')[1];
    const session = getUserSession(chatId);
    session.model = modelId;
    
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: `Model set to: ${modelId}`
    });
    
    // Update the message to remove the keyboard
    await bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: message.message_id }
    );
    
    await bot.sendMessage(chatId, `✅ Model changed to: *${modelId}*`, { parse_mode: 'Markdown' });
  }
});

// Handle regular text messages
bot.on('message', async (msg) => {
  // Ignore commands and empty messages
  if (msg.text?.startsWith('/') || !msg.text?.trim()) return;
  
  const chatId = msg.chat.id;
  await handleUserPrompt(chatId, msg.text);
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Log when the bot is ready
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Log when the bot is ready
console.log('🤖 Telegram bot is running...');

// Export for testing
module.exports = { bot };
