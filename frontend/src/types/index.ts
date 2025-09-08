export interface TodoItem {
  id?: number;
  title: string;
  description?: string;
  priority: number; // 1: 低, 2: 中, 3: 高
  status: number; // 0: 待办, 1: 进行中, 2: 已完成, 3: 取消
  tags?: string[];
  imagePaths?: string[];
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tag {
  id?: number;
  name: string;
  color: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
}

export interface TodoQueryParams {
  status?: number | number[];
  priority?: number;
  tag?: string;
  startDate?: string;
  endDate?: string;
}

export const PriorityLabels = {
  1: '低',
  2: '中',
  3: '高'
};

export const StatusLabels = {
  0: '待办',
  1: '进行中',
  2: '已完成',
  3: '取消'
};

export const PriorityColors = {
  1: '#52c41a', // 绿色 - 低优先级
  2: '#faad14', // 橙色 - 中优先级
  3: '#ff4d4f'  // 红色 - 高优先级
};

export const StatusColors = {
  0: '#d9d9d9', // 灰色 - 待办
  1: '#1890ff', // 蓝色 - 进行中
  2: '#52c41a', // 绿色 - 已完成
  3: '#ff4d4f'  // 红色 - 取消
};
