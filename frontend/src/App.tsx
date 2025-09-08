import React, { useState } from 'react';
import { Layout, Menu, Button, Typography, Space } from 'antd';
import {
  DashboardOutlined,
  UnorderedListOutlined,
  TagsOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import Dashboard from './components/Dashboard';
import TodoList from './components/TodoList';
import TagManager from './components/TagManager';
import './App.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

type MenuKey = 'dashboard' | 'todos' | 'tags';

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuKey>('todos');
  const [showTagManager, setShowTagManager] = useState(false);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: 'todos',
      icon: <UnorderedListOutlined />,
      label: '待办事项',
    },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'todos':
        return <TodoList />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            {collapsed ? 'Todo' : 'TodoList'}
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedMenu]}
          items={menuItems}
          onClick={({ key }) => setSelectedMenu(key as MenuKey)}
          style={{ borderRight: 0 }}
        />
        <div style={{ padding: '16px' }}>
          <Button
            type="dashed"
            icon={<TagsOutlined />}
            onClick={() => setShowTagManager(true)}
            style={{ width: '100%' }}
          >
            {collapsed ? '' : '标签管理'}
          </Button>
        </div>
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: '0 16px', 
          background: '#fff', 
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            <Title level={3} style={{ margin: 0 }}>
              {selectedMenu === 'dashboard' ? '仪表盘' : '待办事项管理'}
            </Title>
          </Space>
          
          <Space>
            <span style={{ color: '#666' }}>
              个人待办事项管理系统
            </span>
          </Space>
        </Header>
        
        <Content style={{ 
          margin: '16px',
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          minHeight: 280,
          overflow: 'auto'
        }}>
          {renderContent()}
        </Content>
      </Layout>

      <TagManager
        visible={showTagManager}
        onCancel={() => setShowTagManager(false)}
      />
    </Layout>
  );
}

export default App;
