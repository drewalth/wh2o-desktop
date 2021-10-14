import React, {useState} from 'react'
import {Button, Modal, Table, notification} from 'antd'
import {DeleteOutlined} from "@ant-design/icons";
import {useGagesContext} from "../Provider/GageProvider/GageContext";
import {httpClient} from "../../lib";
import {Gage} from "../../../types";


const GageTable = ():JSX.Element => {

    const {gages, loadGages} = useGagesContext()
    const [pendingDelete, setPendingDelete] = useState(0)
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Reading',
            dataIndex: 'reading',
            key: 'reading',
            render: (reading: number, val: Gage) => (<>{reading + ' ' + val.metric }</>)
        },
        {
            title: 'Delta',
            dataIndex: 'delta',
            key: 'delta'
        },
        {
            title: 'Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt'
        },
        {
            dataIndex: 'id',
            key: 'id',
            render: (val:number) => (<div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <Button onClick={() => intiateDelete(val)} icon={<DeleteOutlined />} danger/>
            </div>)
        }
    ]

    const intiateDelete = async (id: number) => {
    setPendingDelete(id)
        setDeleteModalVisible(true)
    }

    const handleClose = () => {
        setDeleteModalVisible(false)
        setPendingDelete(0)
    }

    const handleOk = async () => {
        try {
            await httpClient.delete(`/gage?id=${pendingDelete}`).then(res => res.data)
            handleClose()
            await loadGages()
            notification.success({
                message: 'Gage Deleted'
            })
        } catch (e) {
            console.log(e)
        }
    }



    return (
        <>
        <Table dataSource={gages} columns={columns} />
            <Modal title="Are you sure?" visible={deleteModalVisible} onOk={handleOk} onCancel={handleClose}>
                <p>This will remove all associated notifications. This cannot be undone.</p>
            </Modal>
            </>
    )
}

export default GageTable
