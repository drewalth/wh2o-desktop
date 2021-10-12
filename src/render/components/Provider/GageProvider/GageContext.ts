import {createContext, useState, useContext, useEffect} from "react";
import {Gage, RequestStatus} from "../../../../types";
import {httpClient} from "../../../lib";

type GageContextData = {
    requestStatus: RequestStatus
    gages: Gage[]
    loadGages: () => Promise<void>
}

export const GageContext = createContext({} as GageContextData)

export const useGages = ():GageContextData => {
    const [requestStatus, setRequestStatus] = useState<RequestStatus>('loading')
    const [gages, setGages] = useState<Gage[]>([])

    const loadGages = async () => {
        try {
            setRequestStatus('loading')
            const gages = await httpClient.get('/gage').then(res => res.data)
            setGages(gages)
            setRequestStatus('success')
        } catch (e) {
            console.error(e)
            setRequestStatus('failure')
        }
    }

    useEffect(() => {
        loadGages()
    }, [])


    return {
        gages,
        requestStatus,
        loadGages
    }
}

export const useGagesContext = ():GageContextData => useContext(GageContext)
