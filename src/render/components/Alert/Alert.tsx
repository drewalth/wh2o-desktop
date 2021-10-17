import React, { useState } from 'react'
import { AlertTable } from './AlertTable'
import { Modal, Button, Form, Input, Select, notification } from 'antd'
import { CreateAlertDTO } from '../../../types'
import { useGagesContext } from '../Provider/GageProvider'
import * as socketEvents from '../../../socketEvents'
import { useSocket } from '../../hooks'

export const Alert = (): JSX.Element => {
  const socket = useSocket()
  const { gages } = useGagesContext()

  const defaultCreateForm: CreateAlertDTO = {
    name: '',
    value: 0,
    criteria: 'above',
    metric: 'CFS',
    minimum: 0,
    maximum: 0,
    gageId: gages[0]?.id || 0,
  }

  const [modalVisible, setModalVisible] = useState(false)
  const [createForm, setCreateForm] =
    useState<CreateAlertDTO>(defaultCreateForm)

  const handleOk = () => {
    socket.emit(socketEvents.ALERT_CREATED, createForm)
    setModalVisible(false)
    notification.success({
      message: 'Alert Created',
      placement: 'bottomRight',
    })
  }

  const handleCancel = () => {
    setModalVisible(false)
  }

  return (
    <>
      <Modal
        visible={modalVisible}
        destroyOnClose={true}
        title={'Add Alert'}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          onValuesChange={(evt) =>
            setCreateForm(Object.assign({}, createForm, evt))
          }
          initialValues={defaultCreateForm}
        >
          <Form.Item name={'gageId'} label={'Gage'}>
            <Select>
              {gages.map((gage) => (
                <Select.Option key={gage.siteId} value={gage.id}>
                  {gage.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name={'name'} label={'Name'}>
            <Input />
          </Form.Item>
          <Form.Item name={'criteria'} label={'Criteria'}>
            <Select>
              {['above', 'below', 'between'].map((el) => (
                <Select.Option key={el} value={el}>
                  {el}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name={'value'}
            label={'Value'}
            hidden={createForm.criteria === 'between'}
          >
            <Input type={'number'} />
          </Form.Item>
          <Form.Item
            name={'minimum'}
            label={'Minimum'}
            hidden={createForm.criteria !== 'between'}
          >
            <Input type={'number'} max={createForm.maximum} />
          </Form.Item>
          <Form.Item
            name={'maximum'}
            label={'Maximum'}
            hidden={createForm.criteria !== 'between'}
          >
            <Input type={'number'} min={createForm.minimum} />
          </Form.Item>
          <Form.Item name={'metric'} label={'Metric'}>
            <Select>
              {['CFS', 'FT', 'TEMP'].map((el) => (
                <Select.Option key={el} value={el}>
                  {el}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          disabled={!gages.length}
          type={'primary'}
          onClick={() => setModalVisible(true)}
        >
          Add Alert
        </Button>
      </div>
      <AlertTable />
    </>
  )
}
