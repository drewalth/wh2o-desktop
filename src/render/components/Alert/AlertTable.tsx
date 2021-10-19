import React, { useEffect, useState } from 'react'
import { useAlertsContext } from '../Provider/AlertProvider'
import { Button, Table } from 'antd'
import { Alert } from '../../../types'
import { useGagesContext } from '../Provider/GageProvider'
import { DeleteOutlined } from '@ant-design/icons'
import { useSocket } from '../../hooks'
import * as socketEvents from '../../../socketEvents'

export const AlertTable = (): JSX.Element => {
  const { alerts } = useAlertsContext()
  const { gages } = useGagesContext()
  const [columns, setColumns] = useState([])
  const socket = useSocket()

  const handleDelete = (val: number) => {
    socket.emit(socketEvents.ALERT_DELETED, val)
  }

  useEffect(() => {
    setColumns([
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Gage',
        dataIndex: 'gageId',
        key: 'gageId',
        render: (val: number) => {
          const gage = gages.find((g) => g.id === val)
          return gage?.name || 'err'
        },
      },
      {
        title: 'Description',
        dataIndex: 'id',
        key: 'id',
        render: (val: number, alert: Alert) => {
          let test = ''

          test += alert.criteria

          if (alert.criteria === 'between') {
            test += ' ' + alert.minimum + '-' + alert.maximum
          } else {
            test += ' ' + alert.value
          }

          test += ' ' + alert.metric

          return test
        },
      },
      {
        dataIndex: 'id',
        key: 'id',
        render: (val: number) => (
          <div>
            <Button
              onClick={() => handleDelete(val)}
              icon={<DeleteOutlined />}
              danger
            />
          </div>
        ),
      },
    ])
  }, [gages])

  return <Table columns={columns} dataSource={alerts} />
}
