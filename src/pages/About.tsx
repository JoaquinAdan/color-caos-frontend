import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

const About = () => {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{t('about.title')}</h1>
      <p className="mb-6">{t('about.description')}</p>
      <nav>
        <Link to="/" className="text-primary hover:underline">
          {t('about.backToHome')}
        </Link>
      </nav>
    </div>
  )
}

export default About
