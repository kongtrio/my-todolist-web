import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Tag, Space } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { TodoItem, PriorityLabels, StatusLabels } from '../types';
import { todoApi } from '../services/api';

const Dashboard: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载待办事项
  const loadTodos = async () => {
    setLoading(true);
    try {
      const response = await todoApi.getAll();
      if (response.success && response.data) {
        setTodos(response.data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  // 统计数据
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.status === 2).length;
  const inProgressTodos = todos.filter(todo => todo.status === 1).length;
  const pendingTodos = todos.filter(todo => todo.status === 0).length;
  const highPriorityTodos = todos.filter(todo => todo.priority === 3).length;

  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  // 按优先级统计
  const priorityStats = {
    high: todos.filter(todo => todo.priority === 3).length,
    medium: todos.filter(todo => todo.priority === 2).length,
    low: todos.filter(todo => todo.priority === 1).length,
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        {/* 基础统计 */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总待办事项"
              value={totalTodos}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已完成"
              value={completedTodos}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="进行中"
              value={inProgressTodos}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="高优先级"
              value={highPriorityTodos}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>

        {/* 完成率 */}
        <Col xs={24} md={12}>
          <Card title="完成率" loading={loading}>
            <Progress
              type="circle"
              percent={completionRate}
              format={percent => `${percent}%`}
              size={120}
            />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Space>
                <span>已完成: {completedTodos}</span>
                <span>总计: {totalTodos}</span>
              </Space>
            </div>
          </Card>
        </Col>

        {/* 状态分布 */}
        <Col xs={24} md={12}>
          <Card title="状态分布" loading={loading}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>待办</span>
                <span>{pendingTodos}</span>
              </div>
              <Progress percent={totalTodos > 0 ? (pendingTodos / totalTodos) * 100 : 0} strokeColor="#d9d9d9" showInfo={false} />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>进行中</span>
                <span>{inProgressTodos}</span>
              </div>
              <Progress percent={totalTodos > 0 ? (inProgressTodos / totalTodos) * 100 : 0} strokeColor="#1890ff" showInfo={false} />
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>已完成</span>
                <span>{completedTodos}</span>
              </div>
              <Progress percent={totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0} strokeColor="#52c41a" showInfo={false} />
            </div>
          </Card>
        </Col>

        {/* 优先级分布 */}
        <Col xs={24}>
          <Card title="优先级分布" loading={loading}>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
                    {priorityStats.high}
                  </div>
                  <Tag color="#ff4d4f">高优先级</Tag>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                    {priorityStats.medium}
                  </div>
                  <Tag color="#faad14">中优先级</Tag>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {priorityStats.low}
                  </div>
                  <Tag color="#52c41a">低优先级</Tag>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
