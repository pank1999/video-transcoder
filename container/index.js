const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("node:fs/promises");
const path = require("node:path");
const ffmpeg = require("fluent-ffmpeg");

const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "AKIATL2EBYAWXY3CHTNB",
    secretAccessKey:
      process.env.AWS_SECRET_ACCESS_KEY ||
      "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",
  },
});

const BUCKET_NAME = process.env.BUCKET_NAME || "video-transcoding-input";
const KEY = process.env.KEY || "video.mp4";
const PRODUCTION_BUCKET_NAME =
  process.env.PRODUCTION_BUCKET_NAME ||
  "production-video-trancoded-pankajpandey.xyz";

const RESOLUTIONS = [
  { width: 1920, height: 1080, name: "1920x1080" },
  { width: 1280, height: 720, name: "1280x720" },
  { width: 854, height: 480, name: "854x480" },
  { width: 640, height: 360, name: "640x360" },
  { width: 426, height: 240, name: "426x240" },
];

async function init() {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: KEY,
  });

  // download the original file from s3
  const result = await s3Client.send(command);
  const originalFilePath = "original-video.mp4";
  await fs.writeFile(originalFilePath, result.Body);
  const originalVideoPath = path.resolve(originalFilePath);
  // start the transcoding process
  const promises = RESOLUTIONS.map(async (resolution) => {
    const { width, height, name } = resolution;
    const transcodedFilePath = `transcoded-video-${name}.mp4`;
    const transcodedVideoPath = path.resolve(transcodedFilePath);
    return new Promise((resolve, reject) => {
      ffmpeg(originalVideoPath)
        .output(transcodedVideoPath)
        .withVideoCodec("libx264")
        .withAudioCodec("aac")
        .withSize(`${width}x${height}`)
        .format("mp4")
        .on("end", async () => {
          // upload the transcoded file to s3
          const fileContent = await fs.readFile(transcodedVideoPath);
          const uploadCommand = new PutObjectCommand({
            Bucket: PRODUCTION_BUCKET_NAME,
            Key: `transcoded-${name}.mp4`,
            Body: fileContent,
          });
          await s3Client.send(uploadCommand);
          console.log(
            `Transcoded video uploaded to s3 => transcoded-${name}.mp4`
          );
          resolve();
        })
        .on("error", reject)
        .run();
    });
  });
  await Promise.all(promises);
  process.exit(0);
}
init();
