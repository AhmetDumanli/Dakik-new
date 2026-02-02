# Builder stage
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /build

# Copy Maven wrapper and pom.xml for dependency caching
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests

# Extract Spring Boot layers
RUN java -Djarmode=tools -jar target/*.jar extract --layers --destination extracted

# Runtime stage
FROM gcr.io/distroless/java17-debian12

WORKDIR /application

# Copy layers in order (dependencies first for better caching)
COPY --from=builder /build/extracted/dependencies/ ./
COPY --from=builder /build/extracted/spring-boot-loader/ ./
COPY --from=builder /build/extracted/snapshot-dependencies/ ./
COPY --from=builder /build/extracted/application/ ./

ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
