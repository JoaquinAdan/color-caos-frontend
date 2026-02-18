import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'

const LanguageSelector = () => {
  const { i18n, t } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('language', lng)
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={i18n.language === 'es' ? 'default' : 'outline'}
        size="sm"
        onClick={() => changeLanguage('es')}
      >
        {t('language.spanish')}
      </Button>
      <Button
        variant={i18n.language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => changeLanguage('en')}
      >
        {t('language.english')}
      </Button>
    </div>
  )
}

export default LanguageSelector
