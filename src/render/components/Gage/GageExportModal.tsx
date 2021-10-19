import React from 'react'
import { Modal, Typography } from 'antd'
import { Gage } from '../../../types'

type GageExportModalProps = {
  visible: boolean
  onOk: () => void
  onCancel: () => void
  gages: Gage[]
}

export const GageExportModal = ({
  visible,
  onOk,
  onCancel,
  gages,
}: GageExportModalProps): JSX.Element => {
  return (
    <Modal visible={visible} onOk={onOk} onCancel={onCancel}>
      <div style={{ minHeight: 200, maxHeight: 200, overflowY: 'scroll' }}>
        <Typography.Paragraph copyable={true}>
          {JSON.stringify(gages)}
        </Typography.Paragraph>
      </div>
    </Modal>
  )
}
