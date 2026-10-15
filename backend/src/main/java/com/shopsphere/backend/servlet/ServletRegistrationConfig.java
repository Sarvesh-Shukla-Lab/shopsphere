package com.shopsphere.backend.servlet;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Servlet & Filter Registration Configuration.
 *
 * Demonstrates:
 * 1. Registering standard Java Servlets (HttpServlet) inside Spring Boot.
 * 2. Mapping custom Servlet URL endpoints (/api/diagnostics/servlet).
 * 3. Registering standard Servlet Filters (jakarta.servlet.Filter).
 */
@Configuration
public class ServletRegistrationConfig {

    @Bean
    public ServletRegistrationBean<AppDiagnosticsServlet> diagnosticsServletBean() {
        ServletRegistrationBean<AppDiagnosticsServlet> bean =
                new ServletRegistrationBean<>(new AppDiagnosticsServlet(), "/api/diagnostics/servlet");
        bean.setName("AppDiagnosticsServlet");
        bean.setLoadOnStartup(1);
        return bean;
    }

    @Bean
    public FilterRegistrationBean<RequestPerformanceFilter> performanceFilterBean() {
        FilterRegistrationBean<RequestPerformanceFilter> bean = new FilterRegistrationBean<>();
        bean.setFilter(new RequestPerformanceFilter());
        bean.addUrlPatterns("/api/*");
        bean.setOrder(1);
        return bean;
    }
}
