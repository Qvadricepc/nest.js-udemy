# Docker Compose for NestJS with PostgreSQL

This Docker Compose configuration sets up a PostgreSQL database for your NestJS application.

## Getting Started

### Run PostgreSQL Only

To start just the PostgreSQL database:

```bash
docker-compose up -d postgres
```

This will:
- Start PostgreSQL on port 5432
- Create a database named "taskmanagement"
- Set up postgres/postgres as the username/password
- Persist data in a Docker volume

### Connection Details

- **Host**: localhost
- **Port**: 5432
- **Username**: postgres
- **Password**: postgres
- **Database**: taskmanagement

### Using with NestJS

Update your NestJS configuration to use these database settings. For example, in your TypeORM configuration:

```typescript
// In your app.module.ts or database configuration file
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost', // Use 'postgres' if running NestJS in Docker
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'taskmanagement',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true, // Set to false in production
})
```

## Future Enhancements

The docker-compose.yml file includes a commented section for containerizing your NestJS application. When you're ready to run your entire application in Docker, uncomment that section and create a Dockerfile for your NestJS app.

## Using with Rancher

This Docker Compose file can be imported into Rancher:

1. In the Rancher UI, navigate to "Stack" section
2. Click "Add Stack"
3. Upload or paste your Docker Compose file
4. Deploy the stack
