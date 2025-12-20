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

    // Skip auth header injection for health and auth endpoints
    if (isExcluded(path)) {
      return chain.filter(exchange);
    }

    String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
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

    return chain.filter(exchange);
  }

  private boolean isExcluded(String path) {
    if (MATCHER.match("/api/health/**", path)) return true;
    if (MATCHER.match("/api/auth/login", path)) return true;
    if (MATCHER.match("/api/auth/register", path)) return true;
    return false;
  }

  @Override
  public int getOrder() {
    return -100; // Run early
  }
}
