FROM eclipse-temurin:21-jdk-alpine AS builder

RUN apk add --no-cache curl tar bash \
  && curl -fsSL https://archive.apache.org/dist/maven/maven-3/3.9.0/binaries/apache-maven-3.9.0-bin.tar.gz | tar -xz -C /opt \
  && ln -s /opt/apache-maven-3.9.0/bin/mvn /usr/bin/mvn

WORKDIR /app

# FIXED: paths are relative to build context (which is already ./rest)
COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# Stage 2: Run with Java 21 runtime
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

COPY --from=builder /app/target/rest-1.0-SNAPSHOT.jar ./app.jar

CMD ["java", "-jar", "app.jar"]
