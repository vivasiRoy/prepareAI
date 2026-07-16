// Lightweight i18n: UI dictionaries for the app chrome + the directive that
// makes ALL AI-generated content (curricula, lessons, chat, exams) come out
// in the user's language.

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['code']

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  pt: 'Portuguese', hi: 'Hindi', ar: 'Arabic', zh: 'Simplified Chinese',
}

/** Appended to AI prompts so every piece of generated content matches the user's language. */
export function languageDirective(code?: string | null): string {
  if (!code || code === 'en') return ''
  const name = LANGUAGE_NAMES[code]
  if (!name) return ''
  return `\n\nIMPORTANT: Write ALL user-facing content in ${name}. Keep JSON keys and structural fields in English; only the values (titles, summaries, questions, answers, feedback) are in ${name}.`
}

type Dict = Record<string, string>

const en: Dict = {
  dashboard: 'Dashboard',
  myEvents: 'My Events',
  billing: 'Billing',
  settings: 'Settings',
  newEvent: 'New Event',
  features: 'Features',
  howItWorks: 'How It Works',
  pricing: 'Pricing',
  signIn: 'Sign In',
  getStarted: 'Get Started',
  goToDashboard: 'Go to Dashboard',
  signOut: 'Sign out',
  language: 'Language',
}

const dictionaries: Record<LanguageCode, Dict> = {
  en,
  es: { dashboard: 'Panel', myEvents: 'Mis eventos', billing: 'Facturación', settings: 'Ajustes', newEvent: 'Nuevo evento', features: 'Funciones', howItWorks: 'Cómo funciona', pricing: 'Precios', signIn: 'Iniciar sesión', getStarted: 'Empezar', goToDashboard: 'Ir al panel', signOut: 'Cerrar sesión', language: 'Idioma' },
  fr: { dashboard: 'Tableau de bord', myEvents: 'Mes événements', billing: 'Facturation', settings: 'Paramètres', newEvent: 'Nouvel événement', features: 'Fonctionnalités', howItWorks: 'Fonctionnement', pricing: 'Tarifs', signIn: 'Se connecter', getStarted: 'Commencer', goToDashboard: 'Tableau de bord', signOut: 'Se déconnecter', language: 'Langue' },
  de: { dashboard: 'Übersicht', myEvents: 'Meine Events', billing: 'Abrechnung', settings: 'Einstellungen', newEvent: 'Neues Event', features: 'Funktionen', howItWorks: 'So funktioniert’s', pricing: 'Preise', signIn: 'Anmelden', getStarted: 'Loslegen', goToDashboard: 'Zur Übersicht', signOut: 'Abmelden', language: 'Sprache' },
  pt: { dashboard: 'Painel', myEvents: 'Meus eventos', billing: 'Cobrança', settings: 'Configurações', newEvent: 'Novo evento', features: 'Recursos', howItWorks: 'Como funciona', pricing: 'Preços', signIn: 'Entrar', getStarted: 'Começar', goToDashboard: 'Ir ao painel', signOut: 'Sair', language: 'Idioma' },
  hi: { dashboard: 'डैशबोर्ड', myEvents: 'मेरे इवेंट', billing: 'बिलिंग', settings: 'सेटिंग्स', newEvent: 'नया इवेंट', features: 'विशेषताएँ', howItWorks: 'कैसे काम करता है', pricing: 'मूल्य', signIn: 'साइन इन', getStarted: 'शुरू करें', goToDashboard: 'डैशबोर्ड पर जाएँ', signOut: 'साइन आउट', language: 'भाषा' },
  ar: { dashboard: 'لوحة التحكم', myEvents: 'فعالياتي', billing: 'الفوترة', settings: 'الإعدادات', newEvent: 'فعالية جديدة', features: 'المزايا', howItWorks: 'كيف يعمل', pricing: 'الأسعار', signIn: 'تسجيل الدخول', getStarted: 'ابدأ الآن', goToDashboard: 'إلى لوحة التحكم', signOut: 'تسجيل الخروج', language: 'اللغة' },
  zh: { dashboard: '仪表盘', myEvents: '我的活动', billing: '账单', settings: '设置', newEvent: '新建活动', features: '功能', howItWorks: '如何运作', pricing: '价格', signIn: '登录', getStarted: '开始使用', goToDashboard: '进入仪表盘', signOut: '退出登录', language: '语言' },
}

export function getDictionary(code: string): Dict {
  return dictionaries[code as LanguageCode] || en
}
