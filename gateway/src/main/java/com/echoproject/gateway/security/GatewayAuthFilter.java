package com.echoproject.gateway.security;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class GatewayAuthFilter implements GlobalFilter, Ordered {

  private final JwtUtil jwtUtil;
  private static final AntPathMatcher MATCHER = new AntPathMatcher();

  public GatewayAuthFilter(JwtUtil jwtUtil) {
    this.jwtUtil = jwtUtil;
  }

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String path = exchange.getRequest().getURI().getPath();
    String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
    boolean ws = isWebSocketUpgrade(exchange);
    boolean excluded = isExcluded(path);

    if (excluded) {
      return chain.filter(exchange);
    }

    if (ws && path.startsWith("/ws/")) {
      return chain.filter(exchange);
    }

    if (authHeader != null && authHeader.startsWith("Bearer ")) {
      String token = authHeader.substring(7);
      String username = jwtUtil.validateTokenAndGetUsername(token);
      if (username != null) {
        ServerHttpRequest mutated = exchange.getRequest().mutate()
            .headers(httpHeaders -> httpHeaders.set("X-Username", username))
            .build();
        return chain.filter(exchange.mutate().request(mutated).build());
      } else {
        exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
      }
    }
    exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
    return exchange.getResponse().setComplete();
  }

  private boolean isExcluded(String path) {
    if (!path.startsWith("/api/")) return true;
    if (MATCHER.match("/api/health/**", path)) return true;
    if (MATCHER.match("/api/auth/login", path)) return true;
    if (MATCHER.match("/api/auth/register", path)) return true;
    return false;
  }

  @Override
  public int getOrder() {
    return -100; // Run early
  }

  private boolean isWebSocketUpgrade(ServerWebExchange exchange) {
    String connection = header(exchange, "Connection");
    String upgrade = header(exchange, "Upgrade");
    return connection != null && connection.toLowerCase().contains("upgrade") &&
        upgrade != null && upgrade.equalsIgnoreCase("websocket");
  }

  private String header(ServerWebExchange ex, String name) {
    try {
      var values = ex.getRequest().getHeaders().get(name);
      return (values != null && !values.isEmpty()) ? values.get(0) : null;
    } catch (Exception e) { return null; }
  }
}
