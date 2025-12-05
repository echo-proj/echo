# Echo - Collaborative Editing System

A collaborative text editing system built with Spring Boot, similar to Google Docs or Overleaf.

## Features

- User authentication and registration (JWT-based)
- Real-time collaborative document editing
- Version control and change tracking
- User contribution tracking

## Tech Stack

**Backend:**
- Spring Boot 4.0.0
- PostgreSQL
- Spring Security + JWT
- Spring Data JPA
- WebSocket for real-time collaboration

## Getting Started

### Prerequisites
- Java 17
- Docker & Docker Compose
- Maven

### Running the Application

1. Start the PostgreSQL database:
```bash
docker compose up -d
```

2. Run the Spring Boot application:
```bash
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`

## Architecture

This project follows specific architectural patterns and design principles.

📖 **[Read the Architecture Documentation](ARCHITECTURE.md)**