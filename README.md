# FXQL Parser

A NestJS-based Foreign Exchange Query Language (FXQL) Statement Parser that processes and stores currency exchange rate information.

## Features

- FXQL statement parsing and validation
- Singleton Design
- Response compression
- PostgreSQL database integration
- Rate limiting
- Comprehensive logging
- Docker support
- API documentation (Swagger)
- Unit tests

## Prerequisites

- Node.js (v18 or later)
- Docker and Docker Compose
- PostgreSQL (if running locally)

## Installation

### Using Docker

1. Clone the repository:

```bash
git clone https://github.com/yourusername/fxql-parser.git
cd fxql-parser
```

2. Create a `.env` file based on the example:

```bash
cp .env.example .env
```

3. Start the application using Docker Compose:

```bash
docker-compose -f docker-compose.yml up --build -d
```

The application will be available at `http://127.0.0.1:3000/fxql-statements`.

### Local Development

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
# Edit .env with your local database credentials
```

3. Start the development server:

```bash
npm run start:dev
```

## API Documentation

### Base URL

`http://localhost:3000/api`

### Endpoints

#### 1. Parse FXQL Statement

- **Endpoint**: `/fxql-statements`
- **Method**: `POST`
- **Description**: Parses, validates, and saves FXQL statements to the database.

##### Request

- **Content-Type**: `application/json`
- **Body**:

### POST /fxql-statements

Parses and stores FXQL statements.

#### Request Body

```json
{
  "FXQL": "USD-GBP {\n BUY 100\n SELL 200\n CAP 93800\n}"
}
```

#### Success Response (200 OK)

```json
{
  "message": "FXQL Statement Parsed Successfully.",
  "code": "FXQL-200",
  "data": [
    {
      "EntryId": 1,
      "SourceCurrency": "USD",
      "DestinationCurrency": "GBP",
      "SellPrice": 200,
      "BuyPrice": 100,
      "CapAmount": 93800
    }
  ]
}
```

#### Error Responses

- **Status Code**: `400 Bad Request`

  - **Response Body**:

  ```json
  {
    "message": "Invalid FXQL Statement.",
    "code": "FXQL-400"
  }
  ```

- **Status Code**: `429 Too Many Requests`
  - **Response Body**:
  ```json
  {
    "message": "Rate limit exceeded.",
    "code": "FXQL-429"
  }
  ```

## Testing

Run the test suite:

```bash
npm run test
```

Run the end-to-end test:

```bash
npm run test:e2e
```

Run tests with coverage:

```bash
npm run test:cov
```

## Rate Limiting

The API implements rate limiting with the following default settings:

- 100 requests per minute per IP
- Configurable via environment variables:
  - `RATE_LIMIT_TTL`: Time window in seconds
  - `RATE_LIMIT_LIMIT`: Maximum number of requests per window

## Logging

The application logs HTTP requests with the following information:

- Method
- URL
- Status code
- Response size
- Response time
- User agent
- IP address

## Environment Variables

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=fxql_db
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
```
