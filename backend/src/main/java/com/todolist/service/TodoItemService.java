package com.todolist.service;

import com.todolist.dao.TodoItemDao;
import com.todolist.entity.TodoItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TodoItemService {

    @Autowired
    private TodoItemDao todoItemDao;

    public List<TodoItem> getAllTodoItems() {
        return todoItemDao.findAll();
    }

    public TodoItem getTodoItemById(Long id) {
        return todoItemDao.findById(id);
    }

    public TodoItem createTodoItem(TodoItem item) {
        if (item.getPriority() == null) {
            item.setPriority(1); // 默认低优先级
        }
        if (item.getStatus() == null) {
            item.setStatus(0); // 默认待办状态
        }
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());
        return todoItemDao.save(item);
    }

    public TodoItem updateTodoItem(Long id, TodoItem item) {
        TodoItem existingItem = todoItemDao.findById(id);
        if (existingItem == null) {
            throw new RuntimeException("待办事项不存在，ID: " + id);
        }
        
        // 只更新非空字段
        if (item.getTitle() != null) {
            existingItem.setTitle(item.getTitle());
        }
        if (item.getDescription() != null) {
            existingItem.setDescription(item.getDescription());
        }
        if (item.getPriority() != null) {
            existingItem.setPriority(item.getPriority());
        }
        if (item.getStatus() != null) {
            existingItem.setStatus(item.getStatus());
        }
        if (item.getTags() != null) {
            existingItem.setTags(item.getTags());
        }
        if (item.getImagePaths() != null) {
            existingItem.setImagePaths(item.getImagePaths());
        }
        if (item.getCompletedAt() != null) {
            existingItem.setCompletedAt(item.getCompletedAt());
        }
        
        existingItem.setUpdatedAt(LocalDateTime.now());
        return todoItemDao.save(existingItem);
    }

    public void deleteTodoItem(Long id) {
        TodoItem existingItem = todoItemDao.findById(id);
        if (existingItem == null) {
            throw new RuntimeException("待办事项不存在，ID: " + id);
        }
        todoItemDao.deleteById(id);
    }

    public List<TodoItem> getTodoItemsByStatus(Integer status) {
        return todoItemDao.findByStatus(status);
    }

    public List<TodoItem> getTodoItemsByPriority(Integer priority) {
        return todoItemDao.findByPriority(priority);
    }

    public List<TodoItem> getTodoItemsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return todoItemDao.findByDateRange(startDate, endDate);
    }

    public List<TodoItem> getTodoItemsByTag(String tag) {
        return todoItemDao.findByTag(tag);
    }

    public TodoItem updateTodoItemStatus(Long id, Integer status) {
        TodoItem item = todoItemDao.findById(id);
        if (item == null) {
            throw new RuntimeException("待办事项不存在，ID: " + id);
        }
        
        item.setStatus(status);
        item.setUpdatedAt(LocalDateTime.now());
        return todoItemDao.save(item);
    }
}
