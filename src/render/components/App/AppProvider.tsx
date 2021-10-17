import React, { ReactNode } from 'react'
import { GageProvider } from '../Provider/GageProvider'
import { AlertProvider } from '../Provider/AlertProvider'
type AppProviderProps = {
  children: ReactNode
}

export const AppProvider = ({ children }: AppProviderProps): JSX.Element => {
  return (
    <GageProvider>
      <AlertProvider>{children}</AlertProvider>
    </GageProvider>
  )
}
