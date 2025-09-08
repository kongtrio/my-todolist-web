import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Button,
  Space,
  Tag,
  Form,
  Input,
  ColorPicker,
  message,
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Tag as TagType } from '../types';
import { tagApi } from '../services/api';

interface TagManagerProps {
  visible: boolean;
  onCancel: () => void;
}

const TagManager: React.FC<TagManagerProps> = ({ visible, onCancel }) => {
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<TagType | null>(null);
  const [form] = Form.useForm();

  // 加载标签列表
  const loadTags = async () => {
    setLoading(true);
    try {
      const response = await tagApi.getAll();
      if (response.success && response.data) {
        setTags(response.data);
      }
    } catch (error) {
      message.error('加载标签失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadTags();
    }
  }, [visible]);

  // 删除标签
  const handleDelete = async (id: number) => {
    try {
      const response = await tagApi.delete(id);
      if (response.success) {
        message.success('删除成功');
        loadTags();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 编辑标签
  const handleEdit = (tag: TagType) => {
    setEditingTag(tag);
    form.setFieldsValue(tag);
    setShowForm(true);
  };

  // 新增标签
  const handleAdd = () => {
    setEditingTag(null);
    form.resetFields();
    form.setFieldsValue({ color: '#1890ff' });
    setShowForm(true);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      let response;
      if (editingTag?.id) {
        response = await tagApi.update(editingTag.id, values);
      } else {
        response = await tagApi.create(values);
      }

      if (response.success) {
        message.success(editingTag?.id ? '更新成功' : '创建成功');
        setShowForm(false);
        setEditingTag(null);
        loadTags();
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns: ColumnsType<TagType> = [
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <Tag color={record.color}>{name}</Tag>
      ),
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 100,
      render: (color: string) => (
        <div
          style={{
            width: 20,
            height: 20,
            backgroundColor: color,
            borderRadius: 4,
            border: '1px solid #d9d9d9',
          }}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (createdAt: string) => dayjs(createdAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定要删除这个标签吗？"
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
    <>
      <Modal
        title="标签管理"
        open={visible}
        onCancel={onCancel}
        footer={[
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增标签
          </Button>,
          <Button key="close" onClick={onCancel}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        <Table
          columns={columns}
          dataSource={tags}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
        />
      </Modal>

      <Modal
        title={editingTag?.id ? '编辑标签' : '新增标签'}
        open={showForm}
        onCancel={() => setShowForm(false)}
        onOk={handleSubmit}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ color: '#1890ff' }}
        >
          <Form.Item
            name="name"
            label="标签名称"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>

          <Form.Item
            name="color"
            label="标签颜色"
            rules={[{ required: true, message: '请选择标签颜色' }]}
          >
            <ColorPicker
              showText
              format="hex"
              presets={[
                {
                  label: '推荐',
                  colors: [
                    '#f50',
                    '#2db7f5',
                    '#87d068',
                    '#108ee9',
                    '#ff4d4f',
                    '#faad14',
                    '#722ed1',
                    '#13c2c2',
                    '#52c41a',
                    '#eb2f96',
                  ],
                },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TagManager;
