package com.shopsphere.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * DatabaseConnection - Dedicated JDBC Connection Helper
 *
 * Provides direct JDBC (java.sql.Connection) management using MySQL Connector/J.
 * In Spring Boot, Spring Data JPA / HikariCP manages pooled connections automatically
 * via application.properties, while this class provides a direct JDBC utility interface.
 */
@Component
public class DatabaseConnection {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConnection.class);

    private static final String DRIVER_CLASS = "com.mysql.cj.jdbc.Driver";
    private static final String DEFAULT_URL = "jdbc:mysql://localhost:3306/shopsphere_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String DEFAULT_USER = "root";
    private static final String DEFAULT_PASS = "Shukla@123";

    private static String dbUrl = DEFAULT_URL;
    private static String dbUser = DEFAULT_USER;
    private static String dbPass = DEFAULT_PASS;

    public DatabaseConnection(
            @Value("${spring.datasource.url:" + DEFAULT_URL + "}") String url,
            @Value("${spring.datasource.username:" + DEFAULT_USER + "}") String user,
            @Value("${spring.datasource.password:" + DEFAULT_PASS + "}") String pass) {
        dbUrl = url;
        dbUser = user;
        dbPass = pass;
        logger.info("JDBC DatabaseConnection initialized for: {}", dbUrl);
    }

    /**
     * Returns a standard java.sql.Connection using MySQL JDBC Driver.
     *
     * @return Active Connection object
     * @throws SQLException If connection fails
     */
    public static Connection getConnection() throws SQLException {
        try {
            Class.forName(DRIVER_CLASS);
            return DriverManager.getConnection(dbUrl, dbUser, dbPass);
        } catch (ClassNotFoundException e) {
            logger.error("MySQL JDBC Driver not found in classpath: {}", e.getMessage());
            throw new SQLException("MySQL JDBC Driver not found", e);
        }
    }

    /**
     * Quick utility to check if the MySQL database is reachable via JDBC.
     *
     * @return true if connected successfully
     */
    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            logger.error("JDBC Connection test error: {}", e.getMessage());
            return false;
        }
    }
}
