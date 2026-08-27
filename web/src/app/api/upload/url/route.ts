import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import prisma from "@/lib/prisma";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

const BUCKET_NAME = process.env.BUCKET_NAME || "video-transcoding-input";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filename, fileSize, type, resolutions } = body;

    // Basic validation
    if (!filename || !fileSize || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get IP address for anonymous tracking
    // In production (Vercel/AWS), check x-forwarded-for header
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    // Hash IP for privacy
    const ipHash = Buffer.from(ip).toString("base64"); 

    // Find or create anonymous usage record
    let anonymousUsage = await prisma.anonymousUsage.findUnique({
      where: { ipHash },
    });

    if (!anonymousUsage) {
      anonymousUsage = await prisma.anonymousUsage.create({
        data: { ipHash, jobCount: 0, bytesUsed: 0 },
      });
    }

    // Enforce Anonymous Limits
    const MAX_ANONYMOUS_JOBS = 3;
    const MAX_FILE_SIZE_MB = 20 * 1024 * 1024; // 20MB

    if (anonymousUsage.jobCount >= MAX_ANONYMOUS_JOBS) {
      return NextResponse.json({ 
        error: "Anonymous limit reached. Please sign up to continue.",
        code: "LIMIT_REACHED"
      }, { status: 403 });
    }

    if (fileSize > MAX_FILE_SIZE_MB) {
      return NextResponse.json({ 
        error: `File size exceeds the 20MB anonymous limit.`,
        code: "FILE_TOO_LARGE"
      }, { status: 413 });
    }

    // Create a pending job in database
    const jobType = type === "photo" ? "PHOTO" : "VIDEO";
    const job = await prisma.transcodeJob.create({
      data: {
        type: jobType,
        originalSize: fileSize,
        outputs: resolutions, // Store target resolutions as JSON
        anonymousUsageId: anonymousUsage.id,
      },
    });

    // Generate a unique S3 key for this upload
    const ext = filename.split('.').pop();
    const s3Key = `uploads/${job.id}.${ext}`;

    // Create Presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: type === "photo" ? "image/jpeg" : "video/mp4",
      Metadata: {
        jobId: job.id,
      }
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Update job count and bytes used for anonymous user
    await prisma.anonymousUsage.update({
      where: { id: anonymousUsage.id },
      data: {
        jobCount: { increment: 1 },
        bytesUsed: { increment: fileSize },
        lastUsedAt: new Date(),
      },
    });

    return NextResponse.json({ url: presignedUrl, jobId: job.id, key: s3Key });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
