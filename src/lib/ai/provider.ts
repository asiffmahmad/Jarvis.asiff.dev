export interface AIProviderConfig {
  apiKey?: string;
  model: string;
}

/**
 * JARVIS AI Provider Interface
 *
 * Defines the contract that all AI providers (Groq, OpenAI, Claude, etc.)
 * must implement to be compatible with the JARVIS Workspace.
 * 
 * We use the Vercel AI SDK types where applicable.
 */
export interface AIProvider {
  /**
   * The unique identifier for this provider (e.g., 'groq', 'openai')
   */
  readonly id: string;

  /**
   * Returns a configured language model instance from the Vercel AI SDK.
   * This model can then be passed to `streamText`, `generateText`, etc.
   * @param config Optional configuration overriding the defaults.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getModel(config?: Partial<AIProviderConfig>): any;
}
