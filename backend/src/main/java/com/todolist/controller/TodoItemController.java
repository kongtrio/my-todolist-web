package com.todolist.controller;

import com.todolist.entity.TodoItem;
import com.todolist.service.TodoItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "http://localhost:3000")
public class TodoItemController {

    @Autowired
    private TodoItemService todoItemService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllTodoItems(
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer priority,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        try {
            List<TodoItem> items;
            
            if (status != null) {
                items = todoItemService.getTodoItemsByStatus(status);
            } else if (priority != null) {
                items = todoItemService.getTodoItemsByPriority(priority);
            } else if (tag != null && !tag.trim().isEmpty()) {
                items = todoItemService.getTodoItemsByTag(tag);
            } else if (startDate != null && endDate != null) {
                items = todoItemService.getTodoItemsByDateRange(startDate, endDate);
            } else {
                items = todoItemService.getAllTodoItems();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", items);
            response.put("total", items.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取待办事项失败: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getTodoItemById(@PathVariable Long id) {
        try {
            TodoItem item = todoItemService.getTodoItemById(id);
            
            Map<String, Object> response = new HashMap<>();
            if (item != null) {
                response.put("success", true);
                response.put("data", item);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "待办事项不存在");
                return ResponseEntity.status(404).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取待办事项失败: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createTodoItem(@RequestBody TodoItem item) {
        try {
            TodoItem createdItem = todoItemService.createTodoItem(item);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", createdItem);
            response.put("message", "待办事项创建成功");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "创建待办事项失败: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateTodoItem(@PathVariable Long id, @RequestBody TodoItem item) {
        try {
            TodoItem updatedItem = todoItemService.updateTodoItem(id, item);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", updatedItem);
            response.put("message", "待办事项更新成功");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "更新待办事项失败: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteTodoItem(@PathVariable Long id) {
        try {
            todoItemService.deleteTodoItem(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "待办事项删除成功");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "删除待办事项失败: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateTodoItemStatus(@PathVariable Long id, @RequestBody Map<String, Integer> statusUpdate) {
        try {
            Integer status = statusUpdate.get("status");
            if (status == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "状态参数不能为空");
                return ResponseEntity.status(400).body(response);
            }
            
            TodoItem updatedItem = todoItemService.updateTodoItemStatus(id, status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", updatedItem);
            response.put("message", "状态更新成功");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "更新状态失败: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
}
