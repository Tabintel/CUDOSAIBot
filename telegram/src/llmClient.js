const axios = require('axios');
const { llmApiKey, llmApiBase } = require('./config');

/**
 * Sends an OpenAI-compatible chat completion request to the configured LLM API.
 * @param {Object} params
 * @param {string} params.model - The model to use for the completion
 * @param {Array<{role: string, content: string}>} params.messages - Array of message objects with role and content
 * @param {number} [params.maxTokens=1000] - Maximum number of tokens to generate
 * @param {number} [params.temperature=0.7] - Sampling temperature
 * @returns {Promise<string>} The assistant's response content
 */
async function createChatCompletion({ 
  model, 
  messages, 
  maxTokens = 1000, 
  temperature = 0.7 
}) {
  const baseUrl = llmApiBase();
  const apiKey = llmApiKey();

  const url = baseUrl.replace(/\/$/, '') + '/chat/completions';

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const body = {
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
  };

  const response = await axios.post(url, body, { 
    headers, 
    timeout: 120000 
  });
  
  const data = response.data || {};

  // Handle different response formats
  const content = data?.choices?.[0]?.message?.content ||
                 data?.choices?.[0]?.text ||
                 data?.output_text ||
                 data?.message ||
                 '';

  if (!content) {
    throw new Error('Empty response from LLM API');
  }

  return typeof content === 'string' ? content : JSON.stringify(content);
}

/**
 * Generates a response using the LLM with a system prompt and user message
 * @param {string} message - The user's message
 * @param {Object} [options] - Additional options
 * @param {string} [options.model] - The model to use (defaults to config default)
 * @param {string} [options.systemPrompt] - Custom system prompt
 * @returns {Promise<string>} The generated response
 */
async function generateResponse(message, { model, systemPrompt } = {}) {
  const messages = [
    { role: 'system', content: systemPrompt || 'You are a helpful assistant answering concisely.' },
    { role: 'user', content: message }
  ];

  return await createChatCompletion({
    model: model || llmDefaultModel(),
    messages,
  });
}

module.exports = { createChatCompletion, generateResponse };
