import type { MoltbotEnv } from '../types';

/**
 * Build environment variables to pass to the Moltbot container process
 *
 * @param env - Worker environment bindings
 * @returns Environment variables record
 */
export function buildEnvVars(env: MoltbotEnv): Record<string, string> {
  const envVars: Record<string, string> = {};

  // Determine provider from explicit AI_PROVIDER setting or URL detection
  const normalizedGatewayUrl = env.AI_GATEWAY_BASE_URL?.replace(/\/+$/, '');
  const normalizedOpenAIUrl = env.OPENAI_BASE_URL?.replace(/\/+$/, '');
  const isOpenAIGateway = normalizedGatewayUrl?.endsWith('/openai');

  // Explicit provider selection takes precedence, then URL detection
  const isOpenAIProvider = env.AI_PROVIDER === 'openai' || isOpenAIGateway || !!normalizedOpenAIUrl;

  // AI Gateway vars take precedence
  // Map to the appropriate provider env var based on the gateway endpoint
  if (env.AI_GATEWAY_API_KEY) {
    if (isOpenAIProvider) {
      envVars.OPENAI_API_KEY = env.AI_GATEWAY_API_KEY;
    } else {
      envVars.ANTHROPIC_API_KEY = env.AI_GATEWAY_API_KEY;
    }
  }

  // Fall back to direct provider keys
  if (!envVars.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY) {
    envVars.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
  }
  if (!envVars.OPENAI_API_KEY && env.OPENAI_API_KEY) {
    envVars.OPENAI_API_KEY = env.OPENAI_API_KEY;
  }

  // Pass AI_PROVIDER explicitly so start-moltbot.sh knows which provider to configure
  if (env.AI_PROVIDER) {
    envVars.AI_PROVIDER = env.AI_PROVIDER;
  }

  // Pass custom MODEL if specified (e.g., accounts/fireworks/models/kimi-k2p5)
  if (env.MODEL) {
    envVars.MODEL = env.MODEL;
  }

  // Pass base URL (used by start-moltbot.sh to determine provider)
  if (normalizedGatewayUrl) {
    envVars.AI_GATEWAY_BASE_URL = normalizedGatewayUrl;
    // Also set the provider-specific base URL env var
    if (isOpenAIProvider) {
      envVars.OPENAI_BASE_URL = normalizedGatewayUrl;
    } else {
      envVars.ANTHROPIC_BASE_URL = normalizedGatewayUrl;
    }
  } else if (normalizedOpenAIUrl) {
    // Direct OPENAI_BASE_URL takes precedence for OpenAI-compatible providers
    envVars.OPENAI_BASE_URL = normalizedOpenAIUrl;
  } else if (env.ANTHROPIC_BASE_URL) {
    envVars.ANTHROPIC_BASE_URL = env.ANTHROPIC_BASE_URL;
  }
  // Map MOLTBOT_GATEWAY_TOKEN to CLAWDBOT_GATEWAY_TOKEN (container expects this name)
  if (env.MOLTBOT_GATEWAY_TOKEN) envVars.CLAWDBOT_GATEWAY_TOKEN = env.MOLTBOT_GATEWAY_TOKEN;
  if (env.DEV_MODE) envVars.CLAWDBOT_DEV_MODE = env.DEV_MODE; // Pass DEV_MODE as CLAWDBOT_DEV_MODE to container
  if (env.CLAWDBOT_BIND_MODE) envVars.CLAWDBOT_BIND_MODE = env.CLAWDBOT_BIND_MODE;
  if (env.TELEGRAM_BOT_TOKEN) envVars.TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
  if (env.TELEGRAM_DM_POLICY) envVars.TELEGRAM_DM_POLICY = env.TELEGRAM_DM_POLICY;
  if (env.DISCORD_BOT_TOKEN) envVars.DISCORD_BOT_TOKEN = env.DISCORD_BOT_TOKEN;
  if (env.DISCORD_DM_POLICY) envVars.DISCORD_DM_POLICY = env.DISCORD_DM_POLICY;
  if (env.SLACK_BOT_TOKEN) envVars.SLACK_BOT_TOKEN = env.SLACK_BOT_TOKEN;
  if (env.SLACK_APP_TOKEN) envVars.SLACK_APP_TOKEN = env.SLACK_APP_TOKEN;
  if (env.CDP_SECRET) envVars.CDP_SECRET = env.CDP_SECRET;
  if (env.WORKER_URL) envVars.WORKER_URL = env.WORKER_URL;

  return envVars;
}
