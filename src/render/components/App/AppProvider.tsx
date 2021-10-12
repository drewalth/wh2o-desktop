import React,{ReactNode} from "react";
import {GageProvider} from "../Provider/GageProvider/GageProvider";
type AppProviderProps = {
    children: ReactNode
}

export const AppProvider = ({children}:AppProviderProps):JSX.Element => {

    return (
        <GageProvider>
            {children}
        </GageProvider>
    )
}
