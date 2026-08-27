# Deployment & Infrastructure Guide

This document outlines the recommended AWS-centric infrastructure architecture to deploy the Ultimate Media Transcoder SaaS in a production environment. 

The architecture is designed to be highly scalable and decoupled, ensuring that heavy video transcoding jobs do not affect the responsiveness of the web application.

## Infrastructure Architecture

### 1. Web Frontend & API (Next.js)
- **Recommended Platform:** [Vercel](https://vercel.com/) (Preferred for Next.js) or **AWS Amplify Hosting**.
- **Role:** Serves the React frontend and handles API routes (quota validation, S3 pre-signed URL generation).
- **Security:** Needs environment variables for database connection (`DATABASE_URL`), NextAuth secrets, Stripe keys, and AWS credentials (or IAM roles if hosted on AWS) with `s3:PutObject` permissions.

### 2. Database
- **Recommended Platform:** **AWS RDS (PostgreSQL)** or a managed provider like **Supabase** / **Neon**.
- **Role:** Stores user accounts, billing tiers, and anonymous usage quotas.
- **Connection:** Accessed via connection pooling (e.g., PgBouncer or Prisma Accelerate) since serverless Next.js functions can easily exhaust standard database connections.

### 3. Messaging & Storage (AWS)
- **Input Storage:** **Amazon S3 (`video-transcoding-input`)**
  - Configured with an **S3 Event Notification** that automatically sends a message to SQS whenever a new file is uploaded via the Pre-signed URL.
  - Lifecycle rule: Automatically delete raw uploaded videos after 7 days to save costs.
- **Output Storage:** **Amazon S3 (`production-video-trancoded-xyz`)**
  - Stores the final transcoded assets. Can be hooked up to an Amazon CloudFront CDN to deliver the videos quickly to end users.
- **Message Queue:** **Amazon SQS (`video-transcoder-s3-queue`)**
  - Receives the S3 upload events and holds them until a consumer is ready to process them. 

### 4. Consumer Service (The Orchestrator)
- **Recommended Platform:** **AWS ECS (Elastic Container Service) Fargate Service**.
- **Role:** Runs the `src/index.ts` daemon continuously. It polls the SQS queue. 
- **Workflow:** When it picks up an event, it parses the metadata, then uses the `ECS RunTask` API to dynamically spin up a one-off transcoding container for that specific job.
- **IAM Role Needs:** 
  - `sqs:ReceiveMessage`, `sqs:DeleteMessage`
  - `ecs:RunTask`, `iam:PassRole` (to launch the worker containers)

### 5. Transcoding Worker (The Heavy Lifter)
- **Recommended Platform:** **AWS ECS Fargate Task (Standalone)**.
- **Role:** The heavy Docker container (`container/Dockerfile`) containing FFmpeg. 
- **Workflow:** Spun up on-demand by the Consumer. Downloads the file, transcodes it, uploads it, and then terminates. Fargate bills per second of compute, making this highly cost-effective since you only pay when a video is actively being transcoded.
- **IAM Role Needs:**
  - `s3:GetObject` (Input bucket)
  - `s3:PutObject` (Output bucket)

---

## Deployment Steps (High Level)

### Step 1: Provision AWS Core Services
1. Create the two S3 Buckets (Input and Output). Enable CORS on the Input bucket so browsers can upload directly.
2. Create the SQS Queue.
3. Configure the Input S3 Bucket to send `s3:ObjectCreated:*` notifications to the SQS Queue.

### Step 2: Push Docker Images
1. Build the Consumer Docker image and push it to AWS ECR (Elastic Container Registry).
2. Build the Transcoding Worker Docker image and push it to a separate AWS ECR repository.

### Step 3: Configure AWS ECS
1. Create an ECS Cluster.
2. Create a **Task Definition** for the **Transcoding Worker**. Give it the necessary CPU/RAM and point it to the Worker ECR image.
3. Create a **Task Definition** for the **Consumer**. Point it to the Consumer ECR image. Give it the Task Definition ARN of the Worker so it knows what to launch.
4. Run the Consumer as a persistent **ECS Service** (with 1 or more replicas).

### Step 4: Database & Web Deployment
1. Provision your PostgreSQL Database and apply your schema (`npx prisma db push` or `prisma migrate deploy`).
2. Deploy the `web` folder to Vercel/Amplify. Set the `DATABASE_URL` and `AWS_*` environment variables in the Vercel dashboard.

## Scaling Strategies
- **Web Traffic:** Vercel automatically scales Next.js serverless functions to handle millions of uploads/API requests.
- **Transcoding Backlog:** If the SQS queue starts filling up, AWS Auto Scaling can be configured to increase the number of Consumer replicas, allowing multiple videos to trigger concurrent Fargate worker tasks simultaneously.
