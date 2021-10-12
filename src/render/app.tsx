import React, {useEffect} from 'react';
import * as ReactDOM from 'react-dom';
import axios from 'axios'


const load = async () => {
    try {
        const result = await axios.get('http://localhost:3001').then(res => res.data)
        console.log(result)
    } catch (e) {
        console.error(e)
    }
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
