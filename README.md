# Cloud App Development – Movie API (CA1)

**Author:** Adam Kenny  
**Module:** Cloud App Development  
**Weight:** 40%  
**Stack:** AWS CDK, Lambda, API Gateway, DynamoDB, Cognito, CloudWatch, Typescript.

---

## Overview
This assignment replicates a **serverless movie database API** using AWS services, mainly API Gateway and CloudFormation.  

The system is coded entirely in Typescript and uses Node and AWS.

---

## Architecture

| Component | Service | Description |
|------------|----------|-------------|
| **API Gateway** | AWS API Gateway | Exposes public and protected endpoints (`/movies`, `/auth`, `/protected`). |
| **Lambda Functions** | AWS Lambda (Node.js) | Handles all application logic for movies, authentication, and authorization. |
| **Authentication** | Amazon Cognito | Manages user registration, sign-in, and JWT token issuance. |
| **Authorization** | API Gateway Custom Authorizer | Verifies JWT tokens from Cognito before allowing access to protected routes. (Currently not functional 100%) |
| **Database** | Amazon DynamoDB | Stores movies, actors, awards, and cast relationships. |
| **Monitoring** | Amazon CloudWatch | Logs user activity and state changes (POST/DELETE). |

---

## Key Features Implemented

### Authentication System
- Cognito User Pool with email/username login.
- Endpoints:
  - `/auth/signup`
  - `/auth/signin`
  - `/auth/signout`
- On successful sign-in, Cognito returns an **ID Token** and **Access Token** in the CloudWatch console.

### Custom Request Authorizer
- Lambda verifies Cognito tokens using JWKs:
  - `Cookie: token=<AccessToken>`
- Denies requests without valid tokens.
- Logs `[EVENT]` and authorization results to CloudWatch.

**NOTE: This has not been proven in it working but in the fact that it doesn't all things to be done. Please see Video for better explanation!**

### REST API Endpoints

| Method | Endpoint | Description | Auth |
|--------|-----------|--------------|------|
| `GET` | `/movies` | Retrieve all movies | Public |
| `GET` | `/movies/{movieId}` | Get movie by ID | Public |
| `POST` | `/movies` | Add a new movie | Public |
| `DELETE` | `/movies/{movieId}` | Delete a movie | Public |
| `GET` | `/movies/{movieId}/actors` | Get actors for a movie | Public |
| `GET` | `/awards` | List awards | Public |
| `GET` | `/protected` | Example protected route | Public |

**NOTE: These are all public due to above issue**

### Database Seeding
- On deployment, a **custom resource** seeds DynamoDB with:
  - Movies
  - Actors
  - Casts
  - Awards

### Logging
- Protected Lambda **SHOULD** logs user and path:


