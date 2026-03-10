import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import { Button } from './ui/button'

const LanguageSelector = () => {
  const { i18n, t } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('language', lng)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-white/70 bg-white/80 p-1.5 shadow-sm backdrop-blur">
      <div className="hidden items-center gap-2 pl-2 text-slate-500 sm:flex">
        <Languages className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-[0.22em]">
          Lang
        </span>
      </div>
      <Button
        variant={i18n.language === 'es' ? 'default' : 'outline'}
        size="sm"
        onClick={() => changeLanguage('es')}
        className="rounded-full border-0 px-4 text-xs font-semibold uppercase tracking-[0.16em] shadow-none"
      >
        {t('language.spanish')}
      </Button>
      <Button
        variant={i18n.language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => changeLanguage('en')}
        className="rounded-full border-0 px-4 text-xs font-semibold uppercase tracking-[0.16em] shadow-none"
      >
        {t('language.english')}
      </Button>
    </div>
  )
}

export default LanguageSelector
