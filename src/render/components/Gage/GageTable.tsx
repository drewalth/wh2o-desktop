import React, { useEffect, useState } from 'react'
import { Button, Modal, Table, notification, Select } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useGagesContext } from '../Provider/GageProvider'
import { httpClient } from '../../lib'
import moment from 'moment'
import { Gage, GageReading } from '../../../types'

type ReadingSelectProps = {
  readings: GageReading[]
}

const ReadingSelect = ({ readings }: ReadingSelectProps): JSX.Element => {
  const [activeMetric, setAcitveMetric] = useState('CFS')
  const [reading, setReading] = useState<number>()
  const metrics = Array.from(new Set(readings.map((r) => r.metric)))
  useEffect(() => {
    const val = readings.filter((r) => r.metric === activeMetric)[0]?.value

    setReading(val)
  }, [activeMetric, readings])

  return (
    <div>
      {reading}
      {metrics.length > 0 && (
        <Select
          defaultValue={'CFS'}
          bordered={false}
          size={'small'}
          onSelect={(val) => setAcitveMetric(val)}
        >
          {metrics.map((m) => (
            <Select.Option value={m}>{m}</Select.Option>
          ))}
        </Select>
      )}
    </div>
  )
}

const GageTable = (): JSX.Element => {
  const { gages } = useGagesContext()
  const [pendingDelete, setPendingDelete] = useState(0)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Reading',
      dataIndex: 'reading',
      key: 'reading',
      render: (reading: number, val: Gage) => {
        return <ReadingSelect readings={val.readings} />
      },
    },
    {
      title: 'Delta',
      dataIndex: 'delta',
      key: 'delta',
    },
    {
      title: 'Updated',
      dataIndex: 'lastFetch',
      key: 'lastFetch',
      render: (val: Date) => {
        if (val) {
          return moment(val).format('llll')
        }
        return 'n/a'
      },
    },
    {
      dataIndex: 'id',
      key: 'id',
      render: (val: number) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={() => intiateDelete(val)}
            icon={<DeleteOutlined />}
            danger
          />
        </div>
      ),
    },
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
      await httpClient
        .delete(`/gage?id=${pendingDelete}`)
        .then((res) => res.data)
      handleClose()
      notification.success({
        message: 'Gage Deleted',
      })
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <>
      <Table dataSource={gages} columns={columns} />
      <Modal
        title="Are you sure?"
        visible={deleteModalVisible}
        onOk={handleOk}
        onCancel={handleClose}
      >
        <p>
          This will remove all associated notifications. This cannot be undone.
        </p>
      </Modal>
    </>
  )
}

export default GageTable
