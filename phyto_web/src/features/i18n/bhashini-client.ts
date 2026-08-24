/**
 * Bhashini (National Language Translation Mission) API Client Architecture.
 * Configured securely via environment variables without hardcoded secrets.
 */

export interface BhashiniConfig {
  apiKey?: string
  userId?: string
  pipelineUrl?: string
}

export class BhashiniClient {
  private config: BhashiniConfig

  constructor(config?: BhashiniConfig) {
    this.config = {
      apiKey: config?.apiKey || (import.meta.env.VITE_BHASHINI_API_KEY as string | undefined),
      userId: config?.userId || (import.meta.env.VITE_BHASHINI_USER_ID as string | undefined),
      pipelineUrl:
        config?.pipelineUrl ||
        (import.meta.env.VITE_BHASHINI_PIPELINE_URL as string | undefined) ||
        'https://dhruva-api.bhashini.gov.in/services/inference/pipeline',
    }
  }

  /**
   * Translate text from source language to target Indian language.
   * Gracefully falls back if API is unreachable or not configured.
   */
  async translateText(
    text: string,
    sourceLang: 'en' | 'hi' | 'mr',
    targetLang: 'en' | 'hi' | 'mr'
  ): Promise<string> {
    if (sourceLang === targetLang || !text.trim()) {
      return text
    }

    if (!this.config.apiKey) {
      // Return original text if external credentials are not set
      return text
    }

    try {
      const response = await fetch(this.config.pipelineUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.config.apiKey,
          'User-Id': this.config.userId || '',
        },
        body: JSON.stringify({
          pipelineTasks: [
            {
              taskType: 'translation',
              config: {
                language: {
                  sourceLanguage: sourceLang,
                  targetLanguage: targetLang,
                },
              },
            },
          ],
          inputData: {
            input: [{ source: text }],
          },
        }),
      })

      if (!response.ok) {
        return text
      }

      const data = await response.json()
      const translated = data?.pipelineResponse?.[0]?.output?.[0]?.target
      return translated || text
    } catch {
      return text
    }
  }
}

export const bhashini = new BhashiniClient()
