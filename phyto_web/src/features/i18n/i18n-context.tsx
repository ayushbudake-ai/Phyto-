/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback } from 'react'
import {
  type LanguageCode,
  type LanguageInfo,
  SUPPORTED_LANGUAGES,
  translations,
} from './translations'

interface I18nContextType {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  currentLanguageInfo: LanguageInfo
  supportedLanguages: LanguageInfo[]
  t: (key: string, defaultText?: string) => string
}

const STORAGE_LANG_KEY = 'phyto_app_language'

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  currentLanguageInfo: SUPPORTED_LANGUAGES[0],
  supportedLanguages: SUPPORTED_LANGUAGES,
  t: (key: string, defaultText?: string) => defaultText || key,
})

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_LANG_KEY) as LanguageCode | null
      if (stored && (stored === 'en' || stored === 'hi' || stored === 'mr')) {
        return stored
      }
    } catch {
      // ignore
    }
    return 'en'
  })

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang)
    } catch {
      // ignore
    }
  }, [])

  const currentLanguageInfo = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0]
  }, [language])

  const t = useCallback(
    (key: string, defaultText?: string): string => {
      const langDict = translations[language] || translations.en
      if (langDict && langDict[key]) {
        return langDict[key]
      }
      // Fallback to English dictionary
      if (translations.en[key]) {
        return translations.en[key]
      }
      return defaultText || key
    },
    [language]
  )

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      currentLanguageInfo,
      supportedLanguages: SUPPORTED_LANGUAGES,
      t,
    }),
    [language, setLanguage, currentLanguageInfo, t]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  return useContext(I18nContext)
}
