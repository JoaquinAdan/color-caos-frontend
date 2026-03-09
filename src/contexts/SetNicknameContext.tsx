import React, { createContext, useContext, useState } from 'react'

interface SetNicknameContextType {
  isOpen: boolean
  openSetNicknameModal: () => void
  closeSetNicknameModal: () => void
}

const SetNicknameContext = createContext<SetNicknameContextType | undefined>(undefined)

export const SetNicknameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)

  const value: SetNicknameContextType = {
    isOpen,
    openSetNicknameModal: () => setIsOpen(true),
    closeSetNicknameModal: () => setIsOpen(false)
  }

  return (
    <SetNicknameContext.Provider value={value}>
      {children}
    </SetNicknameContext.Provider>
  )
}

export const useSetNicknameModal = () => {
  const context = useContext(SetNicknameContext)
  if (context === undefined) {
    throw new Error('useSetNicknameModal must be used within SetNicknameProvider')
  }
  return context
}
