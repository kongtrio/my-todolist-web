package com.todolist.dao;

import com.todolist.entity.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public class TagDao {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<Tag> tagRowMapper = new RowMapper<Tag>() {
        @Override
        public Tag mapRow(ResultSet rs, int rowNum) throws SQLException {
            Tag tag = new Tag();
            tag.setId(rs.getLong("id"));
            tag.setName(rs.getString("name"));
            tag.setColor(rs.getString("color"));
            tag.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            return tag;
        }
    };

    public List<Tag> findAll() {
        String sql = "SELECT * FROM tags ORDER BY name";
        return jdbcTemplate.query(sql, tagRowMapper);
    }

    public Tag findById(Long id) {
        String sql = "SELECT * FROM tags WHERE id = ?";
        List<Tag> tags = jdbcTemplate.query(sql, tagRowMapper, id);
        return tags.isEmpty() ? null : tags.get(0);
    }

    public Tag findByName(String name) {
        String sql = "SELECT * FROM tags WHERE name = ?";
        List<Tag> tags = jdbcTemplate.query(sql, tagRowMapper, name);
        return tags.isEmpty() ? null : tags.get(0);
    }

    public Tag save(Tag tag) {
        if (tag.getId() == null) {
            return insert(tag);
        } else {
            return update(tag);
        }
    }

    private Tag insert(Tag tag) {
        String sql = "INSERT INTO tags (name, color, created_at) VALUES (?, ?, ?)";
        
        KeyHolder keyHolder = new GeneratedKeyHolder();
        
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setString(1, tag.getName());
            ps.setString(2, tag.getColor());
            ps.setTimestamp(3, Timestamp.valueOf(LocalDateTime.now()));
            return ps;
        }, keyHolder);
        
        tag.setId(keyHolder.getKey().longValue());
        return tag;
    }

    private Tag update(Tag tag) {
        String sql = "UPDATE tags SET name = ?, color = ? WHERE id = ?";
        jdbcTemplate.update(sql, tag.getName(), tag.getColor(), tag.getId());
        return tag;
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM tags WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }
}
