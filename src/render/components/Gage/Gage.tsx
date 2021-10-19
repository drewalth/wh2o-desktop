import React, { useEffect, useState } from 'react'
import GageTable from './GageTable'
import { Button, Modal, notification, Select, AutoComplete, Form } from 'antd'
import { CreateGageDto } from '../../../types'
import { httpClient, usStates } from '../../lib'
import { useGagesContext } from '../Provider/GageProvider'
const defaultForm = {
  // source: GageSource.USGS,
  name: '',
  siteId: '',
}

export const Gage = (): JSX.Element => {
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [createForm, setCreateForm] = useState<CreateGageDto>(defaultForm)
  const { gageSources, loadGageSources, gages } = useGagesContext()
  const [selectedState, setSelectedState] = useState<string>(
    usStates[0].abbreviation
  )
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    (async function () {
      await loadGageSources(selectedState)
    })()
  }, [selectedState])

  const onSearch = (searchText: string) => {
    console.log(searchText)

    const vals = gageSources?.filter((g) =>
      g.gageName.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())
    )

    if (vals.length) {
      setOptions(
        vals.map((g) => ({
          value: g.siteId,
          label: g.gageName,
        }))
      )
    }
  }

  const handleClose = () => {
    setCreateForm(defaultForm)
    setCreateModalVisible(false)
  }

  const handleOk = async () => {
    try {
      const gageName = gageSources.find(
        (g) => g.siteId === createForm.siteId
      )?.gageName

      await httpClient
        .post('/gage', {
          name: gageName,
          siteId: createForm.siteId,
        })
        .then((res) => res.data)
      notification.success({
        message: 'Gage Created',
        placement: 'bottomRight',
      })
      handleClose()
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <>
      <Modal
        destroyOnClose
        visible={createModalVisible}
        onOk={handleOk}
        onCancel={handleClose}
      >
        <Form
          onValuesChange={(val) => {
            setCreateForm(Object.assign({}, createForm, val))
          }}
          initialValues={{ ...createForm }}
        >
          <Form.Item label={'State'}>
            <Select
              defaultValue={'AL'}
              onSelect={(val) => setSelectedState(val)}
            >
              {usStates.map((val, index) => (
                <Select.Option value={val.abbreviation} key={index}>
                  {val.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name={'siteId'} label={'Gage Name'}>
            <AutoComplete options={options} onSearch={onSearch} />
          </Form.Item>
        </Form>
      </Modal>
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 24,
        }}
      >
        <Button
          type={'primary'}
          disabled={gages.length >= 15}
          onClick={() => setCreateModalVisible(true)}
        >
          Add Gage
        </Button>
      </div>
      <GageTable />
    </>
  )
}
