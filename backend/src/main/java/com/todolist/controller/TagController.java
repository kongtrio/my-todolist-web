package com.todolist.controller;

import com.todolist.entity.Tag;
import com.todolist.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tags")
@CrossOrigin(origins = "http://localhost:3000")
public class TagController {

    @Autowired
    private TagService tagService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllTags() {
        try {
            List<Tag> tags = tagService.getAllTags();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", tags);
            response.put("total", tags.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取标签失败: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getTagById(@PathVariable Long id) {
        try {
            Tag tag = tagService.getTagById(id);
            
            Map<String, Object> response = new HashMap<>();
            if (tag != null) {
                response.put("success", true);
                response.put("data", tag);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "标签不存在");
                return ResponseEntity.status(404).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取标签失败: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createTag(@RequestBody Tag tag) {
        try {
            Tag createdTag = tagService.createTag(tag);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", createdTag);
            response.put("message", "标签创建成功");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "创建标签失败: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateTag(@PathVariable Long id, @RequestBody Tag tag) {
        try {
            Tag updatedTag = tagService.updateTag(id, tag);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", updatedTag);
            response.put("message", "标签更新成功");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "更新标签失败: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteTag(@PathVariable Long id) {
        try {
            tagService.deleteTag(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "标签删除成功");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "删除标签失败: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
}
