## Description

Aubill is a secure and scalable user authentication and billing management system with role-based access control. Access is provided by REST API, documented with Swagger.

## Project setup

### Populate .env file using .env.example (change values if needed)
```bash
$ cp .env.example .env
```

### Build containers

```bash
$ docker compose build
```

### Verify localhost ports 3000 and 5432 are available (if no output - they are)
```bash
$ sudo lsof -iTCP:3000 -sTCP:LISTEN
$ sudo lsof -iTCP:5432 -sTCP:LISTEN
```

### Turn on services
```bash
$ docker compose up
```

### Migrate database

```bash
$ docker exec node_app npm run migrate:latest
```

### Visit localhost:3000/api-docs in browser for Swagger documentation

## Manage the project

### Build containers

```bash
$ docker compose build
```

### Rebuild containers without cache

```bash
$ docker compose build --no-cache
```

### Turn on services

```bash
$ docker compose up
```

### Turn off services

```bash
$ docker compose down
```

### Enter node container

```bash
$ docker exec -it node_app sh
```

### Run migrations
```bash
$ docker exec node_app npm run migrate:latest
```

### Revert migrations
```bash
$ docker exec node_app npm run migrate:rollback
```

### Create migration
```bash
$ docker exec node_app npm run migrate:make
```

### Install dependencies
```bash
$ docker exec node_app npm install
```

### Uninstall dependencies
```bash
$ docker exec node_app npm uninstall
```