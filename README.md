# MotoTrade — Peer-to-Peer Used Motorbike Marketplace & Mechanic Inspection

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](Dockerfile)
[![CI/CD](https://img.shields.io/badge/Jenkins-Declarative_Pipeline-D24939?logo=jenkins&logoColor=white)](Jenkinsfile)
[![Health Status](https://img.shields.io/badge/Service-Healthy_100%25-10B981)](#telemetry)

> **Domain:** Automotive Marketplace  
> **Default Port:** `http://localhost:3008`  
> **UI Aesthetic:** Figma Modern Dashboard / Creative Tim Inspired Dark Glassmorphism  

---

## 🏛️ Architectural Overview

```
                        [ Nginx Edge Reverse Proxy ] (Port 80)
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
         [ Web / Figma Dashboard ]       [ REST API / SSE Stream ]
              (HTML5/Tailwind)                  (Node.js / Express)
                    │                                 │
                    └────────────────┬────────────────┘
                                     ▼
                      [ Concurrency & Lock Manager ]
                          (10-Minute Redis Leases)
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
         [ PostgreSQL Storage ]               [ Redis Pub/Sub ]
        (Atomic Transactions)               (State Invalidation)
```

---

## 🚀 Key Features

1. **Figma / Creative Tim Inspired UI**: Dark-slate glassmorphism dashboard, KPI metric cards with live percentage trends, and real-time activity feeds.
2. **High-Concurrency Atomic Locking**: In-memory and Redis distributed lock engine (`SETNX`) preventing race conditions and double-booking.
3. **Telemetry & Observability**: Integrated `/api/v1/health` and `/metrics` (Prometheus-compatible format).
4. **DevOps Hardened**:
   - Multi-stage non-root `Dockerfile`.
   - `docker-compose.yml` for App + PostgreSQL + Redis orchestration.
   - Nginx reverse proxy with IP rate-limiting (`limit_req_zone`).
   - Declarative `Jenkinsfile` for CI/CD automated testing and deployment.
   - Automated AES-256 encrypted database backup and dry-run restore validation script (`backup_and_restore.sh`).

---

## 🛠️ Quick Start

### Option 1: Standalone Node.js (Zero Dependency Installation)
```bash
node server.js
# Access dashboard at http://localhost:3008
```

### Option 2: Docker Compose
```bash
docker compose up -d
```

### Option 3: Automated Database Backup & Recovery Test
```bash
chmod +x backup_and_restore.sh
./backup_and_restore.sh
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Figma-inspired Interactive Dashboard |
| `GET` | `/api/v1/health` | Service health, uptime & memory status |
| `GET` | `/metrics` | Prometheus-compatible metrics |
| `GET` | `/api/v1/items` | List active resources & availability |
| `POST` | `/api/v1/lock` | Acquire atomic 10-minute resource lock |
| `GET` | `/api/v1/audit-logs` | Retrieve real-time event ledger |

---

## 👨‍💻 Author
**Tejas HR**  
*Full-Stack & DevOps Engineer*
