import { createContext, useState, useContext, useEffect } from 'react'
import { Gage, GageEntry } from '../../../../types'
import { httpClient } from '../../../lib'
import { useSocket } from '../../../hooks'
import * as socketEvents from '../../../../socketEvents'
import { notification } from 'antd'

type GageContextData = {
  gages: Gage[]
  gageSources: GageEntry[]
  loadGageSources: (state: string) => Promise<void>
}

export const GageContext = createContext({} as GageContextData)

export const useGages = (): GageContextData => {
  const [gages, setGages] = useState<Gage[]>([])
  const [gageSources, setGageSources] = useState<GageEntry[]>([])
  const socket = useSocket()

  const loadGageSources = async (state: string) => {
    try {
      const data: { state: string; gages: GageEntry[] } = await httpClient
        .get(`/gage-sources?state=${state}`)
        .then((res) => res.data)
      setGageSources(data.gages)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    socket.on(socketEvents.LOAD_GAGES, (gages: Gage[]) => {
      setGages(gages)
    })
  }, [])

  return {
    gages,
    gageSources,
    loadGageSources,
  }
}

export const useGagesContext = (): GageContextData => useContext(GageContext)
