import React, {useState} from 'react';

import { Layout, Menu } from 'antd';
import { UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import * as ReactDOM from 'react-dom';
import {AppProvider} from "./AppProvider";
import {Gage} from "../Gage/Gage";

const {  Content, Footer, Sider } = Layout;

type Tabs = '1' | '2'

function App () {

    const [activeTab, setActiveTab] = useState<Tabs>('1')

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
            >
                <div>wh2o</div>
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} onSelect={({key}) => setActiveTab(key as Tabs)}>
                    <Menu.Item key="1" icon={<UserOutlined />}>
                        Gages
                    </Menu.Item>
                    <Menu.Item key="2" icon={<VideoCameraOutlined />}>
                        Notifications
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout>
                <Content style={{ margin: '24px 16px 0' }}>
                    <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                        {activeTab === '1' && (<Gage />)}
                        {activeTab === '2' && (<div>Notification</div>)}
                    </div>
                </Content>
            </Layout>
        </Layout>
    )
}

function render() {
    ReactDOM.render(<AppProvider><App/></AppProvider>, document.getElementById('app'));
}

render();
