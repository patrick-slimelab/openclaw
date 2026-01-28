// Defaults for agent metadata when upstream does not supply them.
// IMPORTANT: Do not default to Anthropic. Defaults should be a provider/model that
// is broadly available in our typical setups.
export const DEFAULT_PROVIDER = "openai-codex";
export const DEFAULT_MODEL = "gpt-5.2";
// Conservative high context default when unknown; individual model catalogs may override.
export const DEFAULT_CONTEXT_TOKENS = 200_000;
