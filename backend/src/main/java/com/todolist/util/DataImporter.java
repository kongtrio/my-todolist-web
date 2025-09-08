package com.todolist.util;

import com.todolist.entity.TodoItem;
import com.todolist.entity.Tag;
import com.todolist.service.TodoItemService;
import com.todolist.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class DataImporter implements CommandLineRunner {

    @Autowired
    private TodoItemService todoItemService;

    @Autowired
    private TagService tagService;

    private final String[] todoData = {
        "- [x] sven-hadoop 上报hunter #迁云项目-阿里云 ⏫ ➕ 2025-08-29 ✅ 2025-08-29",
        "- [/] 升级mt-spark-submit #迁云项目-阿里云  🔺 ➕ 2025-08-29 📅 2025-09-05 ;; 备注测试",
        "- [x] 开发orc文件对数工具 #迁云项目-阿里云 🔽 ✅ 2025-09-02",
        "- [x] presto HA配置 #迁云项目-阿里云 ;; https://cf.meitu.com/confluence/pages/viewpage.action?pageId=610578636 ✅ 2025-09-04",
        "- [x] hunter、eagle部署调通 #迁云项目-阿里云 ✅ 2025-09-01",
        "- [/] 回归测试神州所有sql #迁云项目-阿里云 🛫 2025-08-28 📅 2025-09-06",
        "- [ ] 米宝医保报销 #个人事项",
        "- [ ] 成人自考报名 #个人事项 🔺",
        "- [-] trino无法通过start命令启动问题排查 #oracle云项目  ;; 潘迪重启机器解决 ➕ 2025-09-01 ❌ 2025-09-02",
        "- [ ] google gid hbase集群运维相关 ➕ 2025-09-01 #oracle云项目",
        "- [x] 帮栗振杰打包arm版本的python依赖 ➕ 2025-09-01 #业务支撑 ;;obs://mt-bigdata/data/sven-spark/pythonzip/python37-arm-for-lzj8.zip ✅ 2025-09-02",
        "- [x] 海外gcp hbase进程监控告警 #oracle云项目 🔽 ➕ 2025-09-01 ✅ 2025-09-01",
        "- [/] 迁云runbook梳理 #迁云项目-阿里云 ;; https://cf.meitu.com/confluence/pages/viewpage.action?pageId=577401845 ⏫ ➕ 2025-09-02",
        "- [ ] OCI FileSystem sdk封装 #oracle云项目 ⏬ ➕ 2025-09-02",
        "- [x] 调度服务改造：注册到不同的redis & shell任务执行设置为成功 #迁云项目-阿里云 🔼 ➕ 2025-09-02 ✅ 2025-09-04",
        "- [ ] hbase offline阿里云集群搭建 🔽 ➕ 2025-09-02 #迁云项目-阿里云",
        "- [x] onesql presto sdk 调整，根据灿煌的要求兼容旧版本的sdk #迁云项目-阿里云 ⏫ ➕ 2025-09-02 ✅ 2025-09-03",
        "- [x] 程璐 任务失败问题排查 #业务支撑 🔺 ➕ 2025-09-04 ✅ 2025-09-04",
        "- [x] 韩雨晞 问题排查 #业务支撑 🔺 ➕ 2025-09-04 ✅ 2025-09-04"
    };

    @Override
    public void run(String... args) throws Exception {
        // 只在特定条件下运行导入（避免每次启动都导入）
        if (args.length > 0 && "import-data".equals(args[0])) {
            importTodoData();
        }
    }

    public void importTodoData() {
        System.out.println("开始导入待办事项数据...");
        
        int imported = 0;
        int skipped = 0;

        for (String line : todoData) {
            try {
                TodoItem todo = parseTodoLine(line);
                if (todo != null) {
                    todoItemService.createTodoItem(todo);
                    imported++;
                    System.out.println("导入成功: " + todo.getTitle());
                } else {
                    skipped++;
                    System.out.println("跳过: " + line);
                }
            } catch (Exception e) {
                skipped++;
                System.err.println("导入失败: " + line + " - " + e.getMessage());
            }
        }

        System.out.println("数据导入完成！成功: " + imported + ", 跳过: " + skipped);
    }

    private TodoItem parseTodoLine(String line) {
        if (line == null || line.trim().isEmpty()) {
            return null;
        }

        TodoItem todo = new TodoItem();
        
        // 解析状态
        int status = parseStatus(line);
        todo.setStatus(status);

        // 解析标题
        String title = parseTitle(line);
        if (title == null || title.trim().isEmpty()) {
            return null;
        }
        todo.setTitle(title.trim());

        // 解析优先级
        todo.setPriority(parsePriority(line));

        // 解析标签
        List<String> tags = parseTags(line);
        todo.setTags(tags);

        // 解析描述
        String description = parseDescription(line);
        if (description != null && !description.trim().isEmpty()) {
            todo.setDescription(description.trim());
        }

        // 设置创建时间
        LocalDateTime createdAt = parseCreatedDate(line);
        if (createdAt != null) {
            todo.setCreatedAt(createdAt);
        } else {
            todo.setCreatedAt(LocalDateTime.now());
        }

        // 解析完成时间（只有已完成的任务才设置）
        if (status == 2) { // 已完成状态
            LocalDateTime completedAt = parseCompletedDate(line);
            if (completedAt != null) {
                todo.setCompletedAt(completedAt);
            } else {
                // 如果没有明确的完成时间，使用创建时间作为完成时间
                todo.setCompletedAt(todo.getCreatedAt());
            }
        }

        todo.setUpdatedAt(LocalDateTime.now());

        return todo;
    }

    private int parseStatus(String line) {
        if (line.contains("- [x]")) return 2; // 已完成
        if (line.contains("- [/]")) return 1; // 进行中
        if (line.contains("- [ ]")) return 0; // 待办
        if (line.contains("- [-]")) return 3; // 取消
        return 0; // 默认待办
    }

    private String parseTitle(String line) {
        // 移除状态标记
        String cleaned = line.replaceFirst("^-\\s*\\[[x/\\s-]\\]\\s*", "");
        
        // 移除标签、优先级符号、日期等
        cleaned = cleaned.replaceAll("#[^\\s]+", ""); // 移除标签
        cleaned = cleaned.replaceAll("[⏫🔺🔼🔽⏬➕📅✅❌🛫]", ""); // 移除符号
        cleaned = cleaned.replaceAll("\\d{4}-\\d{2}-\\d{2}", ""); // 移除日期
        cleaned = cleaned.replaceAll(";;.*", ""); // 移除备注部分
        
        return cleaned.trim();
    }

    private int parsePriority(String line) {
        if (line.contains("⏫") || line.contains("🔺") || line.contains("🔼")) {
            return 3; // 高优先级
        }
        if (line.contains("🔽") || line.contains("⏬")) {
            return 1; // 低优先级
        }
        return 2; // 默认中优先级
    }

    private List<String> parseTags(String line) {
        List<String> tags = new ArrayList<>();
        Pattern tagPattern = Pattern.compile("#([^\\s]+)");
        Matcher matcher = tagPattern.matcher(line);
        
        while (matcher.find()) {
            String tagName = matcher.group(1);
            tags.add(tagName);
            
            // 确保标签存在
            try {
                Tag existingTag = tagService.getTagByName(tagName);
                if (existingTag == null) {
                    Tag newTag = new Tag(tagName, getTagColor(tagName));
                    tagService.createTag(newTag);
                }
            } catch (Exception e) {
                System.err.println("创建标签失败: " + tagName + " - " + e.getMessage());
            }
        }
        
        return tags;
    }

    private String getTagColor(String tagName) {
        // 根据标签名称分配颜色
        if (tagName.contains("阿里云")) return "#ff4d4f";
        if (tagName.contains("oracle")) return "#faad14";
        if (tagName.contains("个人")) return "#52c41a";
        if (tagName.contains("业务")) return "#1890ff";
        return "#722ed1"; // 默认紫色
    }

    private String parseDescription(String line) {
        Pattern descPattern = Pattern.compile(";;\\s*(.+)");
        Matcher matcher = descPattern.matcher(line);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return null;
    }

    private LocalDateTime parseCompletedDate(String line) {
        Pattern completedPattern = Pattern.compile("✅\\s*(\\d{4}-\\d{2}-\\d{2})");
        Matcher matcher = completedPattern.matcher(line);
        if (matcher.find()) {
            try {
                return LocalDateTime.parse(matcher.group(1) + "T18:00:00");
            } catch (Exception e) {
                System.err.println("解析完成日期失败: " + matcher.group(1));
            }
        }
        return null;
    }

    private LocalDateTime parseCreatedDate(String line) {
        Pattern createdPattern = Pattern.compile("➕\\s*(\\d{4}-\\d{2}-\\d{2})");
        Matcher matcher = createdPattern.matcher(line);
        if (matcher.find()) {
            try {
                return LocalDateTime.parse(matcher.group(1) + "T09:00:00");
            } catch (Exception e) {
                System.err.println("解析创建日期失败: " + matcher.group(1));
            }
        }
        return null;
    }
}
