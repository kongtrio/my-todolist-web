import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
  Select,
  DatePicker,
  Input,
  Badge,
  Image,
  Tooltip,
  Form,
  Modal,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { TodoItem, PriorityLabels, StatusLabels, PriorityColors, StatusColors, TodoQueryParams } from '../types';
import { todoApi, fileApi, tagApi } from '../services/api';
import TodoForm from './TodoForm';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

interface TodoListProps {
  onEdit?: (todo: TodoItem) => void;
}

const TodoList: React.FC<TodoListProps> = ({ onEdit }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [filters, setFilters] = useState<TodoQueryParams>({});
  const [defaultStatusFilter] = useState<number[]>([0, 1]); // 默认只显示待办和进行中
  const [quickAddForm] = Form.useForm();
  const [quickAdding, setQuickAdding] = useState(false);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewingTodo, setViewingTodo] = useState<TodoItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 加载待办事项列表
  const loadTodos = async (queryParams?: TodoQueryParams) => {
    setLoading(true);
    try {
      // 获取所有数据，然后在前端筛选
      const response = await todoApi.getAll({ ...queryParams, status: undefined });
      if (response.success && response.data) {
        let filteredTodos = response.data;
        
        // 应用状态筛选（如果有时间过滤，自动包含已完成状态）
        let statusesToShow = queryParams?.status ? 
          (Array.isArray(queryParams.status) ? queryParams.status : [queryParams.status]) : 
          defaultStatusFilter;
        
        // 如果有时间过滤条件，自动包含已完成状态
        if ((queryParams?.startDate || queryParams?.endDate) && !statusesToShow.includes(2)) {
          statusesToShow = [...statusesToShow, 2];
        }
        
        filteredTodos = filteredTodos.filter(todo => statusesToShow.includes(todo.status));
        
        // 应用其他筛选条件
        if (queryParams?.priority) {
          filteredTodos = filteredTodos.filter(todo => todo.priority === queryParams.priority);
        }
        if (queryParams?.tag) {
          filteredTodos = filteredTodos.filter(todo => 
            todo.tags?.some(tag => tag.toLowerCase().includes(queryParams.tag!.toLowerCase()))
          );
        }
        
        // 基于完成时间过滤
        if (queryParams?.startDate || queryParams?.endDate) {
          filteredTodos = filteredTodos.filter(todo => {
            if (!todo.completedAt) return false; // 只显示有完成时间的任务
            
            const completedDate = dayjs(todo.completedAt);
            const startDate = queryParams.startDate ? dayjs(queryParams.startDate).startOf('day') : null;
            const endDate = queryParams.endDate ? dayjs(queryParams.endDate).endOf('day') : null;
            
            
            if (startDate && !completedDate.isAfter(startDate) && !completedDate.isSame(startDate, 'day')) return false;
            if (endDate && !completedDate.isBefore(endDate) && !completedDate.isSame(endDate, 'day')) return false;
            
            return true;
          });
        }
        
        // 排序：先按优先级降序，再按标签分组
        filteredTodos.sort((a, b) => {
          // 先按优先级排序（高到低）
          if (a.priority !== b.priority) {
            return b.priority - a.priority;
          }
          // 相同优先级的按标签排序
          const aFirstTag = a.tags?.[0] || 'zzz'; // 无标签的放在最后
          const bFirstTag = b.tags?.[0] || 'zzz';
          return aFirstTag.localeCompare(bFirstTag);
        });
        
        setTodos(filteredTodos);
      }
    } catch (error) {
      message.error('加载待办事项失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载所有标签
  const loadTags = async () => {
    try {
      const response = await tagApi.getAll();
      if (response.success && response.data) {
        setAllTags(response.data);
      }
    } catch (error) {
      console.error('加载标签失败:', error);
    }
  };

  useEffect(() => {
    loadTodos(filters);
    loadTags();
  }, []);

  // 处理筛选
  const handleFilter = (newFilters: Partial<TodoQueryParams>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    loadTodos(updatedFilters);
  };

  // 清除筛选
  const clearFilters = () => {
    setFilters({});
    setSelectedTag(null);
    loadTodos({});
  };

  // 处理标签点击
  const handleTagClick = (tagName: string) => {
    const newSelectedTag = selectedTag === tagName ? null : tagName;
    setSelectedTag(newSelectedTag);
    const newFilters = { ...filters, tag: newSelectedTag || undefined };
    setFilters(newFilters);
    loadTodos(newFilters);
  };

  // 删除待办事项
  const handleDelete = async (id: number) => {
    try {
      const response = await todoApi.delete(id);
      if (response.success) {
        message.success('删除成功');
        loadTodos(filters);
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 更新状态
  const handleStatusChange = async (id: number, status: number) => {
    try {
      // 获取当前待办事项
      const currentTodo = todos.find(todo => todo.id === id);
      if (!currentTodo) return;

      // 准备更新数据
      const updateData: Partial<TodoItem> = {
        status,
        completedAt: status === 2 ? dayjs().format('YYYY-MM-DD HH:mm:ss') : undefined // 完成时设置完成时间，否则清除
      };

      const response = await todoApi.update(id, updateData);
      if (response.success) {
        message.success('状态更新成功');
        loadTodos(filters);
      }
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  // 编辑待办事项
  const handleEdit = (todo: TodoItem) => {
    setEditingTodo(todo);
    setShowForm(true);
  };

  // 查看待办事项详情
  const handleViewDetail = (todo: TodoItem) => {
    setViewingTodo(todo);
    setShowDetailModal(true);
  };

  // 表单提交成功
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTodo(null);
    loadTodos(filters);
  };

  // 快速添加待办事项
  const handleQuickAdd = async () => {
    try {
      const values = await quickAddForm.validateFields();
      setQuickAdding(true);

      const todoData = {
        title: values.title.trim(),
        priority: 1, // 默认低优先级
        status: 0,   // 默认待办状态
      };

      const response = await todoApi.create(todoData);
      if (response.success) {
        message.success('待办事项创建成功');
        quickAddForm.resetFields();
        loadTodos(filters);
      }
    } catch (error) {
      message.error('创建失败');
    } finally {
      setQuickAdding(false);
    }
  };

  const columns: ColumnsType<TodoItem> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: number) => (
        <Tag color={PriorityColors[priority as keyof typeof PriorityColors]}>
          {PriorityLabels[priority as keyof typeof PriorityLabels]}
        </Tag>
      ),
      filters: [
        { text: '低', value: 1 },
        { text: '中', value: 2 },
        { text: '高', value: 3 },
      ],
      onFilter: (value, record) => record.priority === value,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: number, record) => (
        <Space>
          <Badge
            color={StatusColors[status as keyof typeof StatusColors]}
            text={StatusLabels[status as keyof typeof StatusLabels]}
          />
          <Space size="small">
            {status !== 2 && status !== 3 && (
              <Tooltip title="标记为已完成">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => handleStatusChange(record.id!, 2)}
                />
              </Tooltip>
            )}
            {status === 0 && (
              <Tooltip title="开始进行">
                <Button
                  type="text"
                  size="small"
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleStatusChange(record.id!, 1)}
                />
              </Tooltip>
            )}
            {status === 1 && (
              <Tooltip title="暂停">
                <Button
                  type="text"
                  size="small"
                  icon={<PauseCircleOutlined />}
                  onClick={() => handleStatusChange(record.id!, 0)}
                />
              </Tooltip>
            )}
            {(status === 0 || status === 1) && (
              <Tooltip title="取消">
                <Button
                  type="text"
                  size="small"
                  danger
                  onClick={() => handleStatusChange(record.id!, 3)}
                >
                  取消
                </Button>
              </Tooltip>
            )}
          </Space>
        </Space>
      ),
      filters: [
        { text: '待办', value: 0 },
        { text: '进行中', value: 1 },
        { text: '已完成', value: 2 },
        { text: '取消', value: 3 },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <Space wrap>
          {tags?.map((tag, index) => (
            <Tag key={index} color="blue">
              {tag}
            </Tag>
          )) || '-'}
        </Space>
      ),
    },
    {
      title: '完成时间',
      dataIndex: 'completedAt',
      key: 'completedAt',
      width: 120,
      render: (completedAt: string) => completedAt ? dayjs(completedAt).format('YYYY-MM-DD HH:mm') : '-',
      sorter: (a, b) => {
        if (!a.completedAt && !b.completedAt) return 0;
        if (!a.completedAt) return 1;
        if (!b.completedAt) return -1;
        return dayjs(a.completedAt).unix() - dayjs(b.completedAt).unix();
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (createdAt: string) => dayjs(createdAt).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定要删除这个待办事项吗？"
            onConfirm={() => handleDelete(record.id!)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 快速添加待办事项 */}
      <div style={{ marginBottom: 16, padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
        <Form
          form={quickAddForm}
          layout="inline"
          onFinish={handleQuickAdd}
          style={{ width: '100%' }}
        >
          <Form.Item
            name="title"
            rules={[{ required: true, message: '请输入待办事项标题' }]}
            style={{ flex: 1, marginRight: 8 }}
          >
            <Input
              placeholder="输入待办事项标题，按回车快速添加..."
              onPressEnter={handleQuickAdd}
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={quickAdding}
              size="large"
              icon={<PlusOutlined />}
            >
              快速添加
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* 筛选工具栏 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Select
          placeholder="按状态筛选"
          style={{ width: 360 }}
          mode="multiple"
          allowClear
          onChange={(value) => handleFilter({ status: value })}
          value={Array.isArray(filters.status) ? filters.status : (filters.status !== undefined ? [filters.status] : defaultStatusFilter)}
        >
          <Option value={0}>待办</Option>
          <Option value={1}>进行中</Option>
          <Option value={2}>已完成</Option>
          <Option value={3}>取消</Option>
        </Select>

        <Select
          placeholder="按优先级筛选"
          style={{ width: 120 }}
          allowClear
          onChange={(value) => handleFilter({ priority: value })}
          value={filters.priority}
        >
          <Option value={1}>低</Option>
          <Option value={2}>中</Option>
          <Option value={3}>高</Option>
        </Select>


        <Tooltip title="基于任务完成时间进行筛选，只显示已完成的任务">
          <RangePicker
            placeholder={['完成开始时间', '完成结束时间']}
            onChange={(dates) => {
              if (dates) {
                handleFilter({
                  startDate: dates[0]?.toISOString(),
                  endDate: dates[1]?.toISOString(),
                });
              } else {
                handleFilter({ startDate: undefined, endDate: undefined });
              }
            }}
            value={filters.startDate && filters.endDate ? [dayjs(filters.startDate), dayjs(filters.endDate)] : null}
            presets={[
              {
                label: '今天',
                value: [dayjs().startOf('day'), dayjs().endOf('day')],
              },
              {
                label: '近3天',
                value: [dayjs().subtract(2, 'day').startOf('day'), dayjs().endOf('day')],
              },
              {
                label: '近7天',
                value: [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')],
              },
              {
                label: '近一个月',
                value: [dayjs().subtract(1, 'month').startOf('day'), dayjs().endOf('day')],
              },
            ]}
          />
        </Tooltip>

        <Button onClick={clearFilters}>重置筛选</Button>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowForm(true)}
        >
          新增待办
        </Button>
      </div>

      {/* 标签快速筛选 */}
      {allTags.length > 0 && (
        <div style={{ marginBottom: 16, padding: '12px', background: '#fafafa', borderRadius: '6px' }}>
          <div style={{ marginBottom: 8, fontSize: '14px', fontWeight: 500, color: '#666' }}>快速筛选标签：</div>
          <Space wrap>
            {allTags.map((tag) => (
              <Tag
                key={tag.id}
                color={selectedTag === tag.name ? tag.color : 'default'}
                style={{
                  cursor: 'pointer',
                  border: selectedTag === tag.name ? `2px solid ${tag.color}` : '1px solid #d9d9d9',
                  fontWeight: selectedTag === tag.name ? 'bold' : 'normal'
                }}
                onClick={() => handleTagClick(tag.name)}
              >
                {tag.name}
              </Tag>
            ))}
            {selectedTag && (
              <Button
                size="small"
                type="link"
                onClick={() => handleTagClick(selectedTag)}
                style={{ padding: 0, height: 'auto' }}
              >
                清除标签筛选
              </Button>
            )}
          </Space>
        </div>
      )}

      {/* 待办事项表格 */}
      <Table
        columns={columns}
        dataSource={todos}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          defaultPageSize: 50,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
      />

      {/* 新增/编辑表单 */}
      {showForm && (
        <TodoForm
          visible={showForm}
          todo={editingTodo}
          onCancel={() => {
            setShowForm(false);
            setEditingTodo(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* 详情查看弹窗 */}
      <Modal
        title="待办事项详情"
        open={showDetailModal}
        onCancel={() => {
          setShowDetailModal(false);
          setViewingTodo(null);
        }}
        footer={[
          <Button key="close" onClick={() => setShowDetailModal(false)}>
            关闭
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setShowDetailModal(false);
              handleEdit(viewingTodo!);
            }}
          >
            编辑
          </Button>,
        ]}
        width={600}
      >
        {viewingTodo && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="标题">
              {viewingTodo.title}
            </Descriptions.Item>
            <Descriptions.Item label="描述">
              {viewingTodo.description || '无描述'}
            </Descriptions.Item>
            <Descriptions.Item label="优先级">
              <Tag color={PriorityColors[viewingTodo.priority as keyof typeof PriorityColors]}>
                {PriorityLabels[viewingTodo.priority as keyof typeof PriorityLabels]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Badge
                color={StatusColors[viewingTodo.status as keyof typeof StatusColors]}
                text={StatusLabels[viewingTodo.status as keyof typeof StatusLabels]}
              />
            </Descriptions.Item>
            <Descriptions.Item label="标签">
              <Space wrap>
                {viewingTodo.tags?.map((tag, index) => (
                  <Tag key={index} color="blue">
                    {tag}
                  </Tag>
                )) || '无标签'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="完成时间">
              {viewingTodo.completedAt ? dayjs(viewingTodo.completedAt).format('YYYY-MM-DD HH:mm') : '未完成'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {dayjs(viewingTodo.createdAt).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            {viewingTodo.imagePaths && viewingTodo.imagePaths.length > 0 && (
              <Descriptions.Item label="附件图片">
                <Space wrap>
                  {viewingTodo.imagePaths.map((path, index) => (
                    <Image
                      key={index}
                      width={80}
                      height={80}
                      src={fileApi.getFileUrl(path)}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                  ))}
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default TodoList;
