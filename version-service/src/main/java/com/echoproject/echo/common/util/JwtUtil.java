package com.echoproject.echo.common.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {
  @Value("${jwt.secret}") private String secret;
  @Value("${jwt.expiration}") private Long expiration;
  public String generateToken(String username) { return JWT.create().withSubject(username).withIssuedAt(new Date()).withExpiresAt(new Date(System.currentTimeMillis()+expiration)).sign(Algorithm.HMAC256(secret)); }
  public String validateTokenAndGetUsername(String token) { try { DecodedJWT jwt = JWT.require(Algorithm.HMAC256(secret)).build().verify(token); return jwt.getSubject(); } catch (JWTVerificationException e) { return null; } }
}

