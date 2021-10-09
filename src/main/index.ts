import {ipcMain} from 'electron'

import Store from 'electron-store'
const store = new Store();
const foo = store.get('foo')


console.log('FOO', store.get('foo'))
if(!foo) {
    store.set('foo', 'BAR')
    console.log(store.get('foo'))
}



ipcMain.on("notify", (_, message) => {
    console.log('NOTIFY: ', message)
});
