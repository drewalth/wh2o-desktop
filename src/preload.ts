import { ipcRenderer, contextBridge } from "electron"

contextBridge.exposeInMainWorld("electron", {
    notificationApi: {
        sendNotification(message:any) {
            console.log('AGGGGG')
            ipcRenderer.send("notify", message);
        },
    },
    batteryApi: {},
    fileApi: {},
});
