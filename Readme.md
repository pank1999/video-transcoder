# Ultimate Media Transcoder SaaS

A fully-featured commercial web application that allows users to upload videos and photos, transcoding and resizing them dynamically in the cloud. It features anonymous usage limits and a freemium paywall.

## Architecture

The project is broken down into three main decoupled architectural components:

1. **Next.js Web App & API (`/web`)**
   - **Frontend:** A modern, beautiful React interface (Next.js App Router + Tailwind CSS) where users drag-and-drop media, select resolutions, and configure output formats.
   - **Backend API:** Checks usage quotas (via Prisma & PostgreSQL), enforces the 3-file / 20MB limit for anonymous users based on IP tracking, and generates S3 Pre-signed URLs for direct-to-cloud uploads.

2. **AWS SQS Consumer (`/src/index.ts`)**
   - A Node.js background worker that continuously polls an Amazon SQS Queue. 
   - When a user successfully uploads a file directly to the S3 Input Bucket, S3 triggers an event to SQS. This consumer reads the event, parses the metadata (job ID, requested resolutions), and dynamically spins up a worker container.

3. **Transcoding Worker Container (`/container`)**
   - An ephemeral Docker container built on Alpine Linux equipped with `ffmpeg` and `sharp`. 
   - It reads environment variables passed by the consumer to know exactly what file to download from S3, processes the file dynamically into the requested resolutions, uploads the finished assets to the Production S3 Bucket, and then exits.

## Database Schema (Prisma)

- **User / Accounts:** Managed by NextAuth (for handling Google/Email logins).
- **AnonymousUsage:** Tracks IP hashes to strictly enforce the "3 free jobs without login" rule.
- **TranscodeJob:** Tracks the status (PENDING, PROCESSING, COMPLETED) of a specific job and associates it with either a logged-in User or an Anonymous IP.

## Running Locally

You can spin up the entire local development environment (including the PostgreSQL database, the Next.js Frontend, and the SQS Consumer) using Docker Compose.

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop) installed.
- Valid AWS Credentials configured in your local environment or AWS CLI (for the SQS/S3 integration).

### Startup

1. Run the following command from the root of the project:
   ```bash
   docker-compose up --build
   ```
2. What happens automatically:
   - A **PostgreSQL database** will start on port `5432`.
   - The **Next.js Web App** will install dependencies, push the database schema (`prisma db push`), and start on [http://localhost:3000](http://localhost:3000).
   - The **SQS Consumer** will start listening for messages on your queue.

3. View the app by navigating to [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment Notes
- Ensure your ECS Task Roles and Lambda Execution Roles have the appropriate IAM Policies for S3 (`PutObject`, `GetObject`) and SQS (`ReceiveMessage`, `DeleteMessage`).
- Avoid hardcoding AWS credentials in production; rely entirely on IAM execution roles.
