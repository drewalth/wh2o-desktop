import React, { ReactNode } from 'react'
import { GageContext, useGages } from './GageContext'

type GageProviderProps = {
  children: ReactNode
}

export const GageProvider = ({ children }: GageProviderProps): JSX.Element => {
  return (
    <GageContext.Provider value={useGages()}>{children}</GageContext.Provider>
  )
}
