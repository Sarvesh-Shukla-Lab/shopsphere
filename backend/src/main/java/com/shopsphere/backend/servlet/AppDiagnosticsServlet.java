package com.shopsphere.backend.servlet;

import com.shopsphere.backend.config.DatabaseConnection;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;

/**
 * Custom HTTP Servlet for System Diagnostics.
 *
 * Demonstrates:
 * 1. Java Servlets (extends HttpServlet).
 * 2. Overriding doGet() and doPost() lifecycle methods.
 * 3. Handling HttpServletRequest and HttpServletResponse directly.
 * 4. Writing JSON response streams via PrintWriter.
 * 5. Web integration with embedded Servlet container (Tomcat).
 */
public class AppDiagnosticsServlet extends HttpServlet {

    private static final Logger logger = LoggerFactory.getLogger(AppDiagnosticsServlet.class);

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        logger.info("[SERVLET GET] AppDiagnosticsServlet handling request from: {}", req.getRemoteAddr());

        boolean jdbcConnected = DatabaseConnection.testConnection();
        long activeThreads = Thread.activeCount();
        long totalMemoryMb = Runtime.getRuntime().totalMemory() / (1024 * 1024);
        long freeMemoryMb = Runtime.getRuntime().freeMemory() / (1024 * 1024);

        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.setStatus(HttpServletResponse.SC_OK);
        resp.setHeader("X-ShopSphere-Engine", "Jakarta-Servlet-6.0");

        try (PrintWriter out = resp.getWriter()) {
            out.printf("{\n" +
                    "  \"status\": \"UP\",\n" +
                    "  \"servletName\": \"%s\",\n" +
                    "  \"servletPath\": \"%s\",\n" +
                    "  \"httpMethod\": \"%s\",\n" +
                    "  \"jdbcDatabaseConnected\": %b,\n" +
                    "  \"activeJavaThreads\": %d,\n" +
                    "  \"jvmTotalMemoryMb\": %d,\n" +
                    "  \"jvmFreeMemoryMb\": %d,\n" +
                    "  \"timestamp\": \"%s\"\n" +
                    "}\n",
                    getServletName(),
                    req.getServletPath(),
                    req.getMethod(),
                    jdbcConnected,
                    activeThreads,
                    totalMemoryMb,
                    freeMemoryMb,
                    LocalDateTime.now());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doGet(req, resp);
    }
}
