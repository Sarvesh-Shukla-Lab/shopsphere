package com.shopsphere.backend.servlet;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

/**
 * Custom Servlet Filter for Request Profiling & Metrics.
 *
 * Demonstrates:
 * 1. Java Servlet Filter lifecycle (init, doFilter, destroy).
 * 2. Intercepting web requests and measuring response latency.
 * 3. Adding custom HTTP response headers.
 */
public class RequestPerformanceFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(RequestPerformanceFilter.class);

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        logger.info("[SERVLET FILTER] RequestPerformanceFilter initialized successfully");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        long startTime = System.currentTimeMillis();

        if (request instanceof HttpServletRequest httpRequest && response instanceof HttpServletResponse httpResponse) {
            chain.doFilter(request, response);

            long durationMs = System.currentTimeMillis() - startTime;
            httpResponse.setHeader("X-Response-Time-Ms", String.valueOf(durationMs));

            logger.debug("[FILTER METRIC] {} {} processed in {} ms with status {}",
                    httpRequest.getMethod(), httpRequest.getRequestURI(), durationMs, httpResponse.getStatus());
        } else {
            chain.doFilter(request, response);
        }
    }

    @Override
    public void destroy() {
        logger.info("[SERVLET FILTER] RequestPerformanceFilter destroyed");
    }
}
