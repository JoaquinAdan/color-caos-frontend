import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Button } from './ui/button'

const languages = [
  { code: 'es', key: 'language.spanish' },
  { code: 'en', key: 'language.english' },
] as const

const LanguageSelector = () => {
  const { i18n, t } = useTranslation()
  const [pressing, setPressing] = useState(false)

  const changeLanguage = (lng: string) => {
    if (lng === i18n.language) {
      setPressing(true)
      setTimeout(() => setPressing(false), 300)
      return
    }
    i18n.changeLanguage(lng)
    localStorage.setItem('language', lng)
  }

  return (
    <div className="relative flex w-full items-center rounded-3xl border border-white/70 bg-white/80 p-1.5 shadow-sm backdrop-blur">
      {languages.map(({ code, key }) => {
        const isActive = i18n.language === code
        return (
          <Button
            key={code}
            variant="ghost"
            size="sm"
            onClick={() => changeLanguage(code)}
            className="relative flex-1 rounded-full border-0 text-xs font-semibold uppercase tracking-[0.16em] shadow-none hover:bg-transparent"
          >
            {isActive && (
              <motion.div
                layoutId="lang-indicator"
                className="absolute inset-0 rounded-full bg-foreground"
                animate={{ scale: pressing ? 0.9 : 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-background' : 'text-foreground/60'}`}>
              {t(key)}
            </span>
          </Button>
        )
      })}
    </div>
  )
}

export default LanguageSelector
