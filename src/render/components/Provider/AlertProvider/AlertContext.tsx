import { Alert } from '../../../../types'
import { createContext, useEffect, useState, useContext } from 'react'
import { useSocket } from '../../../hooks'
import * as socketEvents from '../../../../socketEvents'
import { notification } from 'antd'

type AlertContextData = {
  alerts: Alert[]
}

export const AlertContext = createContext({} as AlertContextData)

export const useAlert = (): AlertContextData => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const socket = useSocket()
  useEffect(() => {
    socket.on(socketEvents.LOAD_ALERTS, (alerts: Alert[]) => {
      setAlerts(alerts)
    })
  }, [])

  return {
    alerts,
  }
}

export const useAlertsContext = (): AlertContextData => useContext(AlertContext)
