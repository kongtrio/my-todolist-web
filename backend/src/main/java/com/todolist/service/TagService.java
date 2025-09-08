package com.todolist.service;

import com.todolist.dao.TagDao;
import com.todolist.entity.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TagService {

    @Autowired
    private TagDao tagDao;

    public List<Tag> getAllTags() {
        return tagDao.findAll();
    }

    public Tag getTagById(Long id) {
        return tagDao.findById(id);
    }

    public Tag createTag(Tag tag) {
        // 检查标签名是否已存在（忽略大小写和前后空格）
        String trimmedName = tag.getName().trim();
        Tag existingTag = tagDao.findByName(trimmedName);
        if (existingTag != null) {
            // 如果标签已存在，直接返回现有标签而不是抛出异常
            return existingTag;
        }
        
        tag.setName(trimmedName);
        tag.setCreatedAt(LocalDateTime.now());
        return tagDao.save(tag);
    }

    public Tag updateTag(Long id, Tag tag) {
        Tag existingTag = tagDao.findById(id);
        if (existingTag == null) {
            throw new RuntimeException("标签不存在，ID: " + id);
        }
        
        // 检查新标签名是否与其他标签重复
        Tag tagWithSameName = tagDao.findByName(tag.getName());
        if (tagWithSameName != null && !tagWithSameName.getId().equals(id)) {
            throw new RuntimeException("标签名已存在: " + tag.getName());
        }
        
        tag.setId(id);
        tag.setCreatedAt(existingTag.getCreatedAt());
        return tagDao.save(tag);
    }

    public void deleteTag(Long id) {
        Tag existingTag = tagDao.findById(id);
        if (existingTag == null) {
            throw new RuntimeException("标签不存在，ID: " + id);
        }
        tagDao.deleteById(id);
    }

    public Tag getTagByName(String name) {
        return tagDao.findByName(name);
    }
}
