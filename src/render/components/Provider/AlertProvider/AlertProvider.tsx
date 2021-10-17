import React, { ReactNode } from 'react'
import { useAlert, AlertContext } from './AlertContext'

type AlertProviderProps = {
  children: ReactNode
}

export const AlertProvider = ({
  children,
}: AlertProviderProps): JSX.Element => (
  <AlertContext.Provider value={useAlert()}>{children}</AlertContext.Provider>
)
