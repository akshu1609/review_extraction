// config.js
require('dotenv').config(); // Ensure environment variables are loaded

const OPENAI_CONFIG = {
    API_BASE: "https://cainfra.openai.azure.com/openai/deployments/CR_Bot_4o/chat/completions?api-version=2024-02-15-preview",
    API_KEY: process.env.OPENAI_API_KEY,  // Use the API key from the environment variable
    CHAT_MODEL: "gpt-4",
};

module.exports = OPENAI_CONFIG; // Export the configuration
