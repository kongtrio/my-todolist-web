package com.todolist.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Component
public class DatabaseConfig implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        // 创建数据目录
        java.io.File dataDir = new java.io.File("./data");
        if (!dataDir.exists()) {
            dataDir.mkdirs();
        }

        // 创建上传目录
        java.io.File uploadDir = new java.io.File("./uploads");
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        // 执行数据库初始化脚本
        executeSqlScript();
    }

    private void executeSqlScript() {
        try {
            ClassPathResource resource = new ClassPathResource("schema.sql");
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)
            );

            StringBuilder sqlBuilder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                // 跳过注释行
                if (line.trim().startsWith("--") || line.trim().isEmpty()) {
                    continue;
                }
                sqlBuilder.append(line).append("\n");
            }

            // 按分号分割SQL语句
            String[] sqlStatements = sqlBuilder.toString().split(";");
            
            for (String sql : sqlStatements) {
                sql = sql.trim();
                if (!sql.isEmpty()) {
                    jdbcTemplate.execute(sql);
                }
            }

            System.out.println("数据库初始化完成");
        } catch (Exception e) {
            System.err.println("数据库初始化失败: " + e.getMessage());
        }
    }
}
