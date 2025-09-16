import { createI18n } from 'vue-i18n'
import en from './en.json'

export type LocaleType = 'en'

// Remove Chinese option, only keep English
export const LOCALE_OPTIONS = [
  { value: 'en' as LocaleType, label: 'English', flag: '🇺🇸' }
]

// Always return English locale
export function getSavedLocale(): LocaleType {
  return 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en
  }
})

export default i18n