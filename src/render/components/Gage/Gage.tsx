import React, {useEffect, useState} from 'react'
import GageTable from "./GageTable";
import {Button, Modal, Input, notification} from "antd";
import {CreateGageDto, GageSource, RequestStatus} from "../../../types";
import {httpClient} from "../../lib";
import {useGagesContext} from "../Provider/GageProvider/GageContext";
const defaultForm = {
    source: GageSource.USGS,
    siteId: '',
    name: ''
}

export const Gage = ():JSX.Element => {
    const [createModalVisible, setCreateModalVisible] = useState(false)
    const [createRequestStatus, setCreateRequestStatus] = useState<RequestStatus>('success')
    const [createForm, setCreateForm] = useState<CreateGageDto>(defaultForm)
    const {loadGages} = useGagesContext()

    useEffect(() => {
        // toast?
        console.log('createRequestStatus ', createRequestStatus)
    }, [])

    const handleClose = () => {
        setCreateForm(defaultForm)
        setCreateModalVisible(false)
    }

    const handleOk = async () => {
        try {
            setCreateRequestStatus('loading')
            await httpClient.post('/gage', createForm).then(res => res.data)
            notification.success({
                message: 'Gage Created'
            })
            handleClose()
            await loadGages()
            setCreateRequestStatus('success')
        } catch (e) {
            console.log(e)
        }
    }

    const updateVal = (val: string, key: string) => setCreateForm({...createForm, [key]: val})

    return (
        <>
            <Modal destroyOnClose visible={createModalVisible} onOk={handleOk} onCancel={handleClose}>
               <Input  placeholder={'Site Id'} onChange={({target}) => updateVal(target.value, 'siteId')} />
               <Input placeholder={'Name'} onChange={({target}) => updateVal(target.value, 'name')} />
            </Modal>
            <div style={{width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: 24}} >
                <Button type={'primary'} onClick={() => setCreateModalVisible(true)}>Create Gage</Button>
            </div>
            <GageTable/>
        </>
    )
}
