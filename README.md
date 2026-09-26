<h1 align="center">Microservice-Based Emergency Platform</h1>

<p align="center">
  <em>A production-grade, distributed emergency coordination system built with microservice architecture, enabling real-time dispatch, resource management, and cross-region coordination for public safety operations.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Apache_Kafka-231F20?style=for-the-badge&logo=apachekafka&logoColor=white" alt="Kafka" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Kubernetes" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Kong_Gateway-003459?style=for-the-badge&logo=kong&logoColor=white" alt="Kong" />
  <img src="https://img.shields.io/badge/Netflix_Eureka-E50914?style=for-the-badge&logo=netflix&logoColor=white" alt="Eureka" />
  <img src="https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white" alt="Prometheus" />
  <img src="https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white" alt="Grafana" />
  <img src="https://img.shields.io/badge/Zipkin-FE7A16?style=for-the-badge&logo=jaeger&logoColor=white" alt="Zipkin" />
  <img src="https://img.shields.io/badge/Gatling-FF9E2A?style=for-the-badge&logo=gatling&logoColor=white" alt="Gatling" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/Maven-C71A36?style=flat-square&logo=apachemaven&logoColor=white" alt="Maven" />
  <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/WebSocket-010101?style=flat-square&logo=socketdotio&logoColor=white" alt="WebSocket" />
  <img src="https://img.shields.io/badge/Swagger_UI-85EA2D?style=flat-square&logo=swagger&logoColor=black" alt="Swagger" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>



## The Problem

Emergency coordination across large geographic regions faces critical challenges that existing monolithic systems simply cannot solve:

| Challenge | Impact |
|---|---|
| **Fragmented Communication** | Dispatchers, first responders, hospitals, and control centres operate on siloed systems with no unified real-time view |
| **Resource Contention** | Shared, limited resources (ambulances, ICU beds, hazmat units) are double-dispatched when multiple operators act simultaneously |
| **Single Points of Failure** | Monolithic systems go down entirely. During an emergency, this is catastrophic |
| **No Audit Integrity** | Conventional logging provides no tamper-evident guarantee for post-incident legal review |
| **Scalability Bottlenecks** | Peak disaster events (multi-vehicle accidents, natural disasters) overwhelm systems not designed for elastic scale |
| **Geographic Data Locality** | Incidents in different regions share a single database, creating cross-region latency and contention |

> **In emergency services, system downtime isn't a business inconvenience. It costs lives.**


## The Solution

**Microservice-Based Emergency Platform** is a distributed, event-driven emergency coordination system purpose-built for public safety. It replaces monolithic emergency dispatch software with a resilient microservice architecture that:

- **Eliminates double-dispatch** via Redis distributed locks with atomic Lua-script release
- **Survives partial outages** through a custom circuit breaker with domain-specific fallbacks
- **Scales per-service**: the Incident Service can scale independently of Auth or Audit
- **Guarantees audit integrity** via SHA-256 hash chains and Merkle tree tamper-evident sealing
- **Routes data geographically** through application-level emirate-based database sharding
- **Delivers real-time updates** via WebSocket-powered dashboards and Kafka event streaming
- **Dispatches intelligently** using a haversine-geometry SmartDispatchEngine with multi-criteria scoring
- **Enforces zero-trust security** with JWT + MFA + RBAC + rate limiting + IP blacklisting


## System Architecture

The platform follows a **microservice architecture** with the **database-per-service pattern**. Each service owns its data, communicates synchronously via REST for time-sensitive queries, and publishes events asynchronously through Apache Kafka. All external traffic is routed through Kong API Gateway.

<img width="1156" height="728" alt="Image" src="https://github.com/user-attachments/assets/622d233a-3924-4bba-b8c0-5ca2cac3126d" />

## Microservices Breakdown

### 1. Auth Service: `auth-service` (`:8081`)

The security gateway for the entire platform. Handles user registration with five role types (`DISPATCHER`, `RESPONDER`, `HOSPITAL_ADMIN`, `OPERATOR`, `ADMIN`), JWT authentication (HS256, 1-hour TTL), and email OTP multi-factor authentication mandatory for dispatcher and admin roles.

- Redis-backed sessions with 30-min sliding TTL for cross-instance stateless validation
- IP blacklist/whitelist enforcement and dual-layer rate limiting (Kong + bucket4j)


### 2. Incident Service: `incident-service` (`:8082`)

Manages the complete incident lifecycle (`OPEN` → `IN_PROGRESS` → `RESOLVED` / `CANCELLED`) with strict state-machine enforcement. Supports five incident types (FIRE, MEDICAL, POLICE, ACCIDENT, HAZMAT) across four severity levels.

- Geo-sharded across 3 MySQL databases by emirate hash for write distribution
- Redis-cached active incidents (5-min TTL) and dashboard summaries (1-min TTL) with write-through eviction
- Publishes `incident.created` and `incident.updated` Kafka events


### 3. Resource Service: `resource-service` (`:8083`)

Tracks all emergency assets including units (ambulances, fire trucks, police), hospitals with bed capacity management, and medical equipment inventory with reservation and release operations.

- Redis distributed locks prevent over-reservation of ICU beds and medical resources
- Available-unit queries cached in Redis with write-through eviction
- Fast availability count endpoints for dispatch dashboard integration


### 4. Dispatch Service: `dispatch-service` (`:8084`)

The mission-critical coordination engine. Supports both manual assignment and automated `SmartDispatchEngine` dispatch with proximity, severity, and SLA-based composite scoring. Dispatchers can preview ranked recommendations before committing.

- Dual Redis distributed locks (unit + incident) acquired in fixed order to prevent deadlock
- Custom hand-rolled circuit breaker protects all Resource Service calls with domain-specific fallbacks
- Assignment lifecycle: `ASSIGNED` → `COMPLETED` / `CANCELLED`


### 5. Audit Service: `audit-service` (`:8085`)

Provides tamper-evident, legally admissible audit logging. Consumes events from all 5 Kafka topics into a unified log where each entry stores a SHA-256 content hash. A Merkle tree can be committed over all entries to cryptographically seal the log state.

- Full hash-chain verification detects any tampered or deleted record and identifies its position
- STOMP-over-WebSocket broadcasts every audit event to connected dashboard clients in real-time


### 6. Eureka Server: `eureka-server` (`:8761`)

Netflix Eureka service registry enabling dynamic service discovery and health monitoring across all microservices.


## Infrastructure Components

| Component | Port | Technology | Purpose |
|---|---|---|---|
| **Kong API Gateway** | `8000` | Kong 3.6 | JWT verification, rate limiting (100/min auth, 200/min others), CORS, request routing |
| **Apache Kafka** | `9092` | Confluent 7.5 | Asynchronous event bus with 5 topics, 3 partitions each |
| **Apache Zookeeper** | `2181` | Confluent 7.5 | Kafka cluster coordination |
| **Redis** | `6379` | Redis 7 Alpine | Caching, distributed locks (SETNX + Lua), session storage |
| **MySQL** | `3307` | MySQL 8.0 | Persistent storage with separate database per service + 3 incident shards |
| **Zipkin** | `9411` | OpenZipkin | Distributed tracing via Micrometer spans |
| **Prometheus** | `9090` | Prometheus | Metrics collection from Spring Boot Actuator endpoints |
| **Grafana** | `3000` | Grafana | Real-time monitoring dashboards with pre-provisioned panels |
| **Kafdrop** | `9000` | Kafdrop | Kafka topic browser and consumer-group monitor |
| **Spring Actuator** | per-service | Spring Boot | Health probes at `/actuator/health`, Prometheus metrics at `/actuator/prometheus` |




## Database Design and Geo-Sharding

### Database-Per-Service Pattern

Each microservice owns its dedicated database, ensuring **loose coupling** and **independent deployability**:

| Service | Database(s) | Strategy |
|---|---|---|
| Auth Service | `auth_db` | Single database: users, roles, refresh tokens, IP lists |
| Incident Service | `incident_shard_0`, `incident_shard_1`, `incident_shard_2` | **Geo-sharded** by emirate hash |
| Resource Service | `resource_db` | Single database: units, hospitals, medical resources |
| Dispatch Service | `dispatch_db` | Single database: assignments table |
| Audit Service | `audit_db` | Single database: audit_logs + merkle_roots |

### Geographic Sharding Strategy

The Incident Service implements **application-level database sharding** to distribute write load and confine queries to geographically relevant data:

<img width="800" height="450" alt="Image" src="https://github.com/user-attachments/assets/03ea870f-0998-444a-bad2-5361a9a87d24" />

- A `ShardRoutingAspect` intercepts data access and selects the target datasource from a **deterministic hash** of the `emirate` field
- A `ReadReplicaRouter` aspect routes read-only transactions to replica datasources when available
- Distributes write load and confines incident queries to the geographically relevant shard



## Kafka Event-Driven Architecture

Apache Kafka serves as the **asynchronous event bus**, decoupling producers from consumers and enabling event sourcing patterns:

| Topic | Partitions | Producer | Consumer(s) |
|---|---|---|---|
| `incident.created` | 3 | Incident Service | Dispatch Service, Audit Service |
| `incident.updated` | 3 | Incident Service | Audit Service |
| `resource.assigned` | 3 | Dispatch Service | Audit Service |
| `resource.released` | 3 | Dispatch Service | Audit Service |
| `auth.event` | 1 | Auth Service | Audit Service |

### Why Kafka?

- **Decoupled Services**: Producers don't need to know about consumers. Adding a new analytics service just means adding a consumer group.
- **Event Replay**: Topic retention allows replaying events for debugging, reprocessing, or new service bootstrapping.
- **Guaranteed Delivery**: At-least-once semantics ensure no audit event is ever lost.
- **Backpressure Handling**: Consumers process at their own pace without overloading producers.
- **Monitoring**: Kafdrop (`:9000`) provides a visual Kafka topic browser and consumer-group lag monitor.


## Circuit Breaker Pattern

### The Problem

Synchronous REST calls between microservices introduce **failure propagation risk**. If the Resource Service becomes unavailable, every pending call from the Dispatch Service blocks a thread until the HTTP timeout expires. Under high concurrent load, this thread exhaustion cascades into a full Dispatch Service outage, even though the failure is isolated to one downstream service.

### Custom Implementation

Rather than adopting Resilience4j, the team implemented a **lightweight, hand-rolled `CircuitBreaker`** Spring component using `ConcurrentHashMap` for per-service state and `AtomicInteger`/`AtomicLong` for lock-free counter updates.

<img width="800" height="450" alt="Image" src="https://github.com/user-attachments/assets/cadb9224-8610-44d1-94c3-f1117e468f81" />

## Redis Mechanisms

Redis serves **three distinct roles** in the platform, each addressing a different distributed systems challenge:

### 1. Caching 

**Purpose:** Reduce database read traffic for hot-path queries under concurrent operator load.

| Cache Region | TTL | Eviction Strategy |
|---|---|---|
| `incidents` (by ID) | 5 min | Evicted on status change |
| `incidents` (active list) | 5 min | Evicted on create/update |
| `incidents-dashboard` | 1 min | Evicted on any write |
| `resources` (available units) | 5 min | Evicted on status update |

> **When NOT to cache:** Unit availability inside the lock-protected assignment critical section is read directly from MySQL. A stale `AVAILABLE` from cache could cause double-dispatch.

### 2. Distributed Locks (SETNX + Lua)

**Purpose:** Prevent double-dispatch of emergency units under concurrent operator requests.

```java
// Atomic lock acquisition
redis.opsForValue().setIfAbsent(lockKey, lockValue, 10, TimeUnit.SECONDS);
```

```lua
-- Atomic lock release (Lua script)
if redis.call('get', KEYS[1]) == ARGV[1] then
    return redis.call('del', KEYS[1])
else
    return 0
end
```

## Monitoring and Observability




| Tool | Port | What It Shows |
|---|---|---|
| **Prometheus** | `:9090` | JVM metrics, HTTP request rates, cache hit ratios, custom business metrics |
| **Grafana** | `:3000` | Pre-provisioned dashboards with service health, request latency, error rates |
| **Zipkin** | `:9411` | End-to-end distributed traces across Kong → Services → Kafka |
| **Kafdrop** | `:9000` | Kafka topic browser, consumer-group lag, partition distribution |
| **Spring Actuator** | per-service | `/actuator/health` liveness/readiness probes |
| **Circuit Breaker Logs** | — | State transitions logged at INFO, rejections at WARNING |

<img width="1500" height="606" alt="Image" src="https://github.com/user-attachments/assets/daab90bd-61e1-4c42-a933-cd1acd93bc9d" />



## Frontend

The platform includes a full-featured **React 19** single-page application built with **Vite** and **Tailwind CSS**:

<img width="1906" height="877" alt="Image" src="https://github.com/user-attachments/assets/0c0e7203-aacd-48df-88f8-1ffd87f102b7" />


## Testing and Load Testing

### Functional Test Suite (20 Test Cases)

| # | Scenario | Expected | Result |
|---|---|---|---|
| TC01 | User registration with valid data | 201 Created | Pass |
| TC02 | Login with MFA trigger for DISPATCHER | 200, `mfaRequired: true`, OTP sent | Pass |
| TC03 | MFA OTP verification within TTL | 200, full-access JWT | Pass |
| TC04 | Expired OTP (>10 min) | 401 Unauthorized | Pass |
| TC05 | Create CRITICAL incident in Dubai | 201, incident UUID | Pass |
| TC06 | Missing required field in incident body | 400, field error message | Pass |
| TC07 | Active incidents, cache miss | 200, DB query executed | Pass |

### Security Testing

| Test | Result |
|---|---|
| JWT payload tampering | Kong returns 401, signature mismatch |
| CORS from `http://evil.com` | No `Access-Control-Allow-Origin` header returned |
| Directory traversal | 400, UUID path-parameter parsing failure |
| Brute-force login (110 attempts) | HTTP 429 on request 101 |

### Stress Testing with Gatling

The Gatling load simulation (`EmergencyLoadSimulation.scala`) models the complete incident lifecycle:

```
Ramp Profile:
  ├── 10 users over 30 seconds (warm-up)
  ├── 5 users/sec sustained for 2 minutes
  ├── Surge to 20 users/sec over 1 minute
  ├── 20 users/sec sustained for 2 minutes (peak)
  └── Gradual ramp-down
```

**Assertions:** p95 response time ≤ 2,000 ms · Successful request rate ≥ 95%



## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Java | 21+ |
| Maven | 3.9+ |
| Node.js | 18+ |
| Docker & Docker Compose | Latest |
| Git | Latest |

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/microservice-emergency-platform.git
cd microservice-emergency-platform
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Infrastructure (Docker)

```bash
docker compose up -d
```

This starts: MySQL, Redis, Kafka, Zookeeper, Zipkin, Kong, Prometheus, Grafana, and Kafdrop.

### 4. Build the Shared Library

```bash
cd shared && mvn clean install -DskipTests && cd ..
```

### 5. Start Microservices

Start each service via Maven or your IDE in the following order:

```bash
# 1. Eureka Server (wait for it to be UP)
cd eureka-server && mvn spring-boot:run

# 2. Auth Service
cd auth-service && mvn spring-boot:run

# 3. Incident Service
cd incident-service && mvn spring-boot:run

# 4. Resource Service
cd resource-service && mvn spring-boot:run

# 5. Dispatch Service
cd dispatch-service && mvn spring-boot:run

# 6. Audit Service
cd audit-service && mvn spring-boot:run
```

### 6. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 7. Access Services

| Service | URL |
|---|---|
| **Frontend** | http://localhost:5173 |
| **Kong Gateway** | http://localhost:8000 |
| **Eureka Dashboard** | http://localhost:8761 |
| **Grafana** | http://localhost:3000 (admin/admin) |
| **Prometheus** | http://localhost:9090 |
| **Zipkin** | http://localhost:9411 |
| **Kafdrop** | http://localhost:9000 |
| **Kong Admin** | http://localhost:8001 |
| **Swagger UI** | http://localhost:{service-port}/swagger-ui.html |


## Kubernetes Deployment

Production-grade Kubernetes manifests are provided in the `k8s/` directory:

```
k8s/
├── 00-namespace.yaml              # Namespace isolation
├── 01-secrets.yaml                 # Kubernetes Secrets for credentials
├── 01-tls-secret.yaml              # TLS certificate secret
├── 02-configmap.yaml               # Application configuration
├── 02-configmap-kafkasvc.yaml      # Kafka service configuration
├── 03-zookeeper.yaml               # Zookeeper StatefulSet
├── 04-kafka.yaml                   # Kafka StatefulSet
├── 05-redis.yaml                   # Redis Deployment
├── 06-mysql.yaml                   # MySQL StatefulSet
├── 08-observability.yaml           # Prometheus + Grafana + Zipkin
├── 09-eureka-server.yaml           # Eureka Server Deployment
├── 10-microservices.yaml           # All 5 microservice Deployments
├── 11-kong.yaml                    # Kong API Gateway
└── 12-hpa.yaml                     # Horizontal Pod Autoscaler rules
```

### Deploy to Kubernetes

```bash
kubectl apply -f k8s/ --recursive
```


## Contributors

<table>
  <tr>
    <td align="center"><strong>Yohannis Adamu</strong><br/>ID: 1093892</td>
    <td align="center"><strong>Indalu Taresa</strong><br/>ID: 1093915</td>
    <td align="center"><strong>Biniam Negash</strong><br/>ID: 1093887</td>
  </tr>
</table>

> **Course:** CSC408, Distributed Information Systems · **Instructor:** Prof. Mourad Elhadef · **Semester:** Spring 2026

<p align="center">
  <strong>Built for public safety</strong>
  <br/>
  <em>Because when seconds count, your architecture shouldn't be the bottleneck.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Tests-20/20_Passing-brightgreen?style=for-the-badge" alt="Tests" />
  <img src="https://img.shields.io/badge/Coverage-5_Services-blue?style=for-the-badge" alt="Coverage" />
</p>
