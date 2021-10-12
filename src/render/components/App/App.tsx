import React, {useEffect, useState} from 'react';
import * as ReactDOM from 'react-dom';
import {CreateGageDto, Gage, GageSource} from "../../../types";
import {httpClient} from "../../lib";
import {AppProvider} from "./AppProvider";
import {useGagesContext} from "../Provider/GageProvider/GageContext";


function App () {

const {requestStatus, gages} = useGagesContext()

    return (
        <div>
            <h1>Request Status: {requestStatus}</h1>
            <h1>Gages: {JSON.stringify(gages)}</h1>
        </div>
    )
}

function render() {
    ReactDOM.render(<AppProvider><App/></AppProvider>, document.getElementById('app'));
}

render();
