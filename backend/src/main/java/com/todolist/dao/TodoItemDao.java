package com.todolist.dao;

import com.todolist.entity.TodoItem;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public class TodoItemDao {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final RowMapper<TodoItem> todoItemRowMapper = new RowMapper<TodoItem>() {
        @Override
        public TodoItem mapRow(ResultSet rs, int rowNum) throws SQLException {
            TodoItem item = new TodoItem();
            item.setId(rs.getLong("id"));
            item.setTitle(rs.getString("title"));
            item.setDescription(rs.getString("description"));
            item.setPriority(rs.getInt("priority"));
            item.setStatus(rs.getInt("status"));
            
            // 解析JSON格式的标签
            String tagsJson = rs.getString("tags");
            if (tagsJson != null && !tagsJson.isEmpty()) {
                try {
                    List<String> tags = objectMapper.readValue(tagsJson, new TypeReference<List<String>>() {});
                    item.setTags(tags);
                } catch (Exception e) {
                    item.setTags(new ArrayList<>());
                }
            } else {
                item.setTags(new ArrayList<>());
            }
            
            // 解析JSON格式的图片路径
            String imagePathsJson = rs.getString("image_paths");
            if (imagePathsJson != null && !imagePathsJson.isEmpty()) {
                try {
                    List<String> imagePaths = objectMapper.readValue(imagePathsJson, new TypeReference<List<String>>() {});
                    item.setImagePaths(imagePaths);
                } catch (Exception e) {
                    item.setImagePaths(new ArrayList<>());
                }
            } else {
                item.setImagePaths(new ArrayList<>());
            }
            
            Timestamp completedAt = rs.getTimestamp("completed_at");
            if (completedAt != null) {
                item.setCompletedAt(completedAt.toLocalDateTime());
            }
            
            item.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            item.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
            
            return item;
        }
    };

    public List<TodoItem> findAll() {
        String sql = "SELECT * FROM todo_items ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, todoItemRowMapper);
    }

    public TodoItem findById(Long id) {
        String sql = "SELECT * FROM todo_items WHERE id = ?";
        List<TodoItem> items = jdbcTemplate.query(sql, todoItemRowMapper, id);
        return items.isEmpty() ? null : items.get(0);
    }

    public TodoItem save(TodoItem item) {
        if (item.getId() == null) {
            return insert(item);
        } else {
            return update(item);
        }
    }

    private TodoItem insert(TodoItem item) {
        String sql = "INSERT INTO todo_items (title, description, priority, status, tags, image_paths, completed_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        
        final String tagsJson;
        final String imagePathsJson;
        try {
            tagsJson = item.getTags() != null ? objectMapper.writeValueAsString(item.getTags()) : null;
            imagePathsJson = item.getImagePaths() != null ? objectMapper.writeValueAsString(item.getImagePaths()) : null;
        } catch (Exception e) {
            throw new RuntimeException("JSON processing error", e);
        }
        
        jdbcTemplate.update(sql,
                item.getTitle(),
                item.getDescription(),
                item.getPriority(),
                item.getStatus(),
                tagsJson,
                imagePathsJson,
                item.getCompletedAt() != null ? Timestamp.valueOf(item.getCompletedAt()) : null,
                Timestamp.valueOf(LocalDateTime.now()),
                Timestamp.valueOf(LocalDateTime.now()));
        
        // 获取最后插入的ID
        Long id = jdbcTemplate.queryForObject("SELECT last_insert_rowid()", Long.class);
        
        item.setId(id);
        return item;
    }

    private TodoItem update(TodoItem item) {
        String sql = "UPDATE todo_items SET title = ?, description = ?, priority = ?, status = ?, tags = ?, image_paths = ?, completed_at = ?, updated_at = ? WHERE id = ?";
        
        String tagsJson;
        String imagePathsJson;
        try {
            tagsJson = item.getTags() != null ? objectMapper.writeValueAsString(item.getTags()) : null;
            imagePathsJson = item.getImagePaths() != null ? objectMapper.writeValueAsString(item.getImagePaths()) : null;
        } catch (Exception e) {
            throw new RuntimeException("JSON processing error", e);
        }
        
        jdbcTemplate.update(sql,
                item.getTitle(),
                item.getDescription(),
                item.getPriority(),
                item.getStatus(),
                tagsJson,
                imagePathsJson,
                item.getCompletedAt() != null ? Timestamp.valueOf(item.getCompletedAt()) : null,
                Timestamp.valueOf(LocalDateTime.now()),
                item.getId());
        
        return item;
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM todo_items WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public List<TodoItem> findByStatus(Integer status) {
        String sql = "SELECT * FROM todo_items WHERE status = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, todoItemRowMapper, status);
    }

    public List<TodoItem> findByPriority(Integer priority) {
        String sql = "SELECT * FROM todo_items WHERE priority = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, todoItemRowMapper, priority);
    }

    public List<TodoItem> findByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = "SELECT * FROM todo_items WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, todoItemRowMapper, 
            Timestamp.valueOf(startDate), 
            Timestamp.valueOf(endDate));
    }

    public List<TodoItem> findByTag(String tag) {
        String sql = "SELECT * FROM todo_items WHERE tags LIKE ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, todoItemRowMapper, "%" + tag + "%");
    }
}
