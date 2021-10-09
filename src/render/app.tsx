import React, {useEffect} from 'react';
import * as ReactDOM from 'react-dom';
import axios from 'axios'
import * as Electron from "electron";


declare global {
    interface Window {electron: any}
}

const electron = window.electron

const load = async () => {
    // try {
    //     const result = await axios.get('https://pokeapi.co/api/v2/pokemon/ditto')
    //     console.log(result)
    // } catch (e) {
    //     console.error(e)
    // }

    electron.notificationApi.sendNotification('AYOOO')
}


function App () {

    useEffect(() => {
        load()
    }, [])
    return (<h2>wh2o</h2>)
}

function render() {
    ReactDOM.render(<App/>, document.getElementById('app'));
}

render();
