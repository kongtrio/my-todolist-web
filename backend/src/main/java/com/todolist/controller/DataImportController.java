package com.todolist.controller;

import com.todolist.util.DataImporter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/import")
@CrossOrigin(origins = "http://localhost:3000")
public class DataImportController {

    @Autowired
    private DataImporter dataImporter;

    @PostMapping("/todos")
    public ResponseEntity<Map<String, Object>> importTodos() {
        try {
            dataImporter.importTodoData();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "数据导入成功");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "数据导入失败: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
}
