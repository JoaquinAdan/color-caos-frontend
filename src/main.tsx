import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import './index.css'
import './i18n/config'
import { router } from './router'
import { SetNicknameProvider } from './contexts/SetNicknameContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SetNicknameProvider>
      <RouterProvider router={router} />
    </SetNicknameProvider>
  </StrictMode>,
)
