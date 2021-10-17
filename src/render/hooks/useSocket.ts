import { io, Socket } from 'socket.io-client'
import * as socketEvents from '../../socketEvents'
import { notification } from 'antd'

const socket = io('http://localhost:3001')
socket.emit(socketEvents.CONNECTION)

socket.on(socketEvents.CREATE_ERROR, () => {
  notification.error({
    message: 'Something went wrong...',
    placement: 'bottomRight',
  })
})

export const useSocket = (): Socket => socket
