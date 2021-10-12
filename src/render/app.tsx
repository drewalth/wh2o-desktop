import React, {useEffect, useState} from 'react';
import * as ReactDOM from 'react-dom';
import {CreateGageDto, Gage} from "../types";
import {httpClient} from "./lib";


function App () {
    const [gages, setGages] = useState<Gage[]>([])
    const [form, setForm] = useState<CreateGageDto>({
        name: '',
        siteId: ''
    })

    const load = async () => {
        try {
            const getRes = await httpClient.get('/gage').then(res => res.data)
            setGages(getRes)
        } catch (e) {
            console.error(e)
        }
    }

    const handleSubmit = async () => {
        try {
            debugger
            const result = await httpClient.post('/gage', form).then(res => res.data)
            console.log(result)
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        load()
    }, [])


    return (
        <div>
            <h2>wh2o</h2>
            {gages.length && (
                JSON.stringify(gages)
            )}
            <label>Name</label>
            <input type={'text'} onChange={({target}) => {
                setForm({
                    ...form,
                    name: target.value
                })
            }} />
            <label>Site Id</label>
            <input type={'text'} onChange={({target}) => {
                setForm({
                    ...form,
                    siteId: target.value
                })
            }} />
            <button onClick={handleSubmit}>Submit</button>

        </div>
    )
}

function render() {
    ReactDOM.render(<App/>, document.getElementById('app'));
}

render();
