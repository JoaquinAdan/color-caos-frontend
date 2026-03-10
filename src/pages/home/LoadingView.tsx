import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'

export const LoadingView = () => {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100svh-80px)]">
      <Card className="w-full max-w-md p-6">
        <p className="text-center text-muted-foreground">
          {t('home.loading')}
        </p>
      </Card>
    </div>
  )
}
