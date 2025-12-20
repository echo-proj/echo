package com.echoproject.echo.security.filter;

import com.echoproject.echo.security.service.CustomUserDetails;
import com.echoproject.echo.user.models.User;
import com.echoproject.echo.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Optional;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class HeaderAuthenticationFilter extends OncePerRequestFilter {

  private final UserRepository userRepository;

  public HeaderAuthenticationFilter(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String username = request.getHeader("X-Username");
    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
      Optional<User> userOpt = userRepository.findByUsername(username);
      if (userOpt.isPresent()) {
        User user = userOpt.get();
        CustomUserDetails details = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(), new ArrayList<>());
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
      }
    }
    filterChain.doFilter(request, response);
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getRequestURI();
    if (path.startsWith("/api/health/")) return true;
    if (path.equals("/api/auth/login") || path.equals("/api/auth/register")) return true;
    return false;
  }
}
