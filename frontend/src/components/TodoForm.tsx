import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Button,
  Space,
  Tag,
  message,
  Image,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { TodoItem, Tag as TagType } from '../types';
import { todoApi, tagApi, fileApi } from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

interface TodoFormProps {
  visible: boolean;
  todo?: TodoItem | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ visible, todo, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<TagType[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<number>(0);

  // 加载标签列表
  const loadTags = async () => {
    try {
      const response = await tagApi.getAll();
      if (response.success && response.data) {
        setTags(response.data);
      }
    } catch (error) {
      console.error('加载标签失败:', error);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    if (visible) {
      if (todo) {
        // 编辑模式
        form.setFieldsValue({
          ...todo,
          completedAt: todo.completedAt ? dayjs(todo.completedAt) : null,
        });
        setCurrentStatus(todo.status || 0);

        // 设置已上传的图片
        if (todo.imagePaths) {
          const uploadedFiles: UploadFile[] = todo.imagePaths.map((path, index) => ({
            uid: `${index}`,
            name: path,
            status: 'done',
            url: fileApi.getFileUrl(path),
          }));
          setFileList(uploadedFiles);
        }
      } else {
        // 新增模式
        form.resetFields();
        setFileList([]);
        setCurrentStatus(0);
      }
    }
  }, [visible, todo, form]);

  // 处理状态变更
  const handleStatusChange = (status: number) => {
    setCurrentStatus(status);
    
    // 如果状态改为已完成，自动设置完成时间为当前时间
    if (status === 2) {
      form.setFieldValue('completedAt', dayjs());
    } else {
      // 如果状态不是已完成，清除完成时间
      form.setFieldValue('completedAt', null);
    }
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 处理图片路径
      const imagePaths = fileList
        .filter(file => file.status === 'done')
        .map(file => file.name || file.response?.fileName)
        .filter(Boolean);

      const todoData = {
        ...values,
        completedAt: values.completedAt ? values.completedAt.toISOString() : null,
        imagePaths,
      };

      let response;
      if (todo?.id) {
        // 更新
        response = await todoApi.update(todo.id, todoData);
      } else {
        // 创建
        response = await todoApi.create(todoData);
      }

      if (response.success) {
        message.success(todo?.id ? '更新成功' : '创建成功');
        onSuccess();
      }
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理文件上传
  const handleUpload = async (file: File) => {
    try {
      const response = await fileApi.uploadSingle(file);
      if (response.success && response.data) {
        return {
          name: response.data.fileName,
          url: response.data.fileUrl,
        };
      }
    } catch (error) {
      message.error('文件上传失败');
      throw error;
    }
  };

  // 自定义上传
  const customRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      const result = await handleUpload(file);
      onSuccess(result);
    } catch (error) {
      onError(error);
    }
  };

  // 添加新标签
  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    try {
      const response = await tagApi.create({
        name: newTag.trim(),
        color: '#1890ff',
      });

      if (response.success && response.data) {
        // 检查标签是否已存在，避免重复添加
        const existingTag = tags.find(tag => tag.name === response.data!.name);
        if (!existingTag) {
          setTags([...tags, response.data]);
        }
        
        // 自动选中新创建的标签
        const currentTags = form.getFieldValue('tags') || [];
        if (!currentTags.includes(response.data!.name)) {
          form.setFieldValue('tags', [...currentTags, response.data!.name]);
        }
        
        setNewTag('');
        setShowNewTagInput(false);
        message.success('标签创建成功');
      }
    } catch (error) {
      message.error('标签创建失败');
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <Modal
      title={todo?.id ? '编辑待办事项' : '新增待办事项'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      okText="确定"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priority: 1,
          status: 0,
        }}
      >
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: '请输入标题' }]}
        >
          <Input placeholder="请输入待办事项标题" />
        </Form.Item>

        <Form.Item name="description" label="描述">
          <TextArea
            rows={3}
            placeholder="请输入详细描述（可选）"
          />
        </Form.Item>

        <Space style={{ width: '100%' }} size="large">
          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select style={{ width: 120 }}>
              <Option value={1}>低</Option>
              <Option value={2}>中</Option>
              <Option value={3}>高</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select style={{ width: 120 }} onChange={handleStatusChange}>
              <Option value={0}>待办</Option>
              <Option value={1}>进行中</Option>
              <Option value={2}>已完成</Option>
              <Option value={3}>取消</Option>
            </Select>
          </Form.Item>
        </Space>

        <Form.Item 
          name="completedAt" 
          label="完成时间"
          tooltip="只有状态为已完成时才需要设置完成时间"
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            placeholder="选择完成时间（可选）"
            style={{ width: '100%' }}
            disabled={currentStatus !== 2}
          />
        </Form.Item>

        <Form.Item name="tags" label="标签">
          <Select
            mode="multiple"
            placeholder="选择或创建标签"
            style={{ width: '100%' }}
            dropdownRender={(menu) => (
              <>
                {menu}
                <div style={{ padding: '8px 0' }}>
                  {showNewTagInput ? (
                    <Space style={{ padding: '0 8px' }}>
                      <Input
                        size="small"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="输入新标签名称"
                        onPressEnter={handleAddTag}
                      />
                      <Button size="small" type="primary" onClick={handleAddTag}>
                        添加
                      </Button>
                      <Button size="small" onClick={() => setShowNewTagInput(false)}>
                        取消
                      </Button>
                    </Space>
                  ) : (
                    <Button
                      type="dashed"
                      style={{ width: '100%' }}
                      onClick={() => setShowNewTagInput(true)}
                    >
                      <PlusOutlined /> 添加新标签
                    </Button>
                  )}
                </div>
              </>
            )}
          >
            {tags.map((tag) => (
              <Option key={tag.id} value={tag.name}>
                <Tag color={tag.color}>{tag.name}</Tag>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="图片">
          <Upload
            customRequest={customRequest}
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList: newFileList }) => setFileList(newFileList)}
            accept="image/*"
            multiple
          >
            {fileList.length >= 8 ? null : uploadButton}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TodoForm;
