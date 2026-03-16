# ---------- 1) Build Stage ----------
FROM eclipse-temurin:25-jdk-alpine AS build
WORKDIR /app

# Gradle 래퍼와 설정 파일 복사
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

RUN chmod +x gradlew

RUN ./gradlew dependencies --no-daemon

COPY src src

RUN ./gradlew clean bootJar --no-daemon


# ---------- 2) Runtime Stage ----------
FROM eclipse-temurin:25-jre-alpine AS runtime
WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

ENV JAVA_OPTS="\
    -XX:+UseContainerSupport \
    -XX:InitialRAMPercentage=60.0 \
    -XX:MaxRAMPercentage=70.0 \
    -XX:+UseG1GC \
    -XX:MaxGCPauseMillis=100 \
    -XX:+UseStringDeduplication \
    -Djdk.virtualThreadScheduler.parallelism=2 \
    -Djdk.virtualThreadScheduler.maxPoolSize=128 \
    -XX:MetaspaceSize=128M \
    -XX:MaxMetaspaceSize=256M \
    -XX:+HeapDumpOnOutOfMemoryError \
    -XX:HeapDumpPath=/app/logs/heapdump.hprof \
    -XX:+ExitOnOutOfMemoryError \
    -Djava.security.egd=file:/dev/./urandom \
    -Xlog:gc*:file=/app/logs/gc.log:time,level,tags:filecount=3,filesize=5M "


RUN mkdir -p /app/logs && \
    addgroup -S spring && adduser -S spring -G spring && \
    chown -R spring:spring /app

USER spring
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]