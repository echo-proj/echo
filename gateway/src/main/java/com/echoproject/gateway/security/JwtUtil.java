package com.echoproject.gateway.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {
  @Value("${jwt.secret}")
  private String secret;

  public String validateTokenAndGetUsername(String token) {
    try {
      DecodedJWT jwt = JWT.require(Algorithm.HMAC256(secret)).build().verify(token);
      return jwt.getSubject();
    } catch (JWTVerificationException e) {
      return null;
    }
  }
}

