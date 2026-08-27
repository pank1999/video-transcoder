const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("node:fs/promises");
const path = require("node:path");
const ffmpeg = require("fluent-ffmpeg");

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

const BUCKET_NAME = process.env.BUCKET_NAME || "video-transcoding-input";
const KEY = process.env.KEY || "video.mp4";
const PRODUCTION_BUCKET_NAME =
  process.env.PRODUCTION_BUCKET_NAME ||
  "production-video-trancoded-pankajpandey.xyz";

const JOB_TYPE = process.env.JOB_TYPE || "video"; // "video" or "photo"

const defaultResolutions = [
  { width: 1920, height: 1080, name: "1920x1080" },
  { width: 1280, height: 720, name: "1280x720" },
  { width: 854, height: 480, name: "854x480" },
  { width: 640, height: 360, name: "640x360" },
  { width: 426, height: 240, name: "426x240" },
];

let RESOLUTIONS = defaultResolutions;
if (process.env.RESOLUTIONS) {
  // Expected format: "1920x1080,1280x720"
  RESOLUTIONS = process.env.RESOLUTIONS.split(',').map(res => {
    const [width, height] = res.split('x').map(Number);
    return { width, height, name: res.trim() };
  });
}

async function init() {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: KEY,
  });

  // download the original file from s3
  const result = await s3Client.send(command);
  // parse extension from KEY
  const ext = path.extname(KEY) || (JOB_TYPE === "photo" ? ".jpg" : ".mp4");
  const originalFilePath = `original-file${ext}`;
  await fs.writeFile(originalFilePath, result.Body);
  const originalVideoPath = path.resolve(originalFilePath);
  // start the transcoding process
  const promises = RESOLUTIONS.map(async (resolution) => {
    const { width, height, name } = resolution;
    const outExt = JOB_TYPE === "photo" ? ".jpg" : ".mp4";
    const transcodedFilePath = `transcoded-file-${name}${outExt}`;
    const transcodedVideoPath = path.resolve(transcodedFilePath);
    return new Promise((resolve, reject) => {
      let f = ffmpeg(originalVideoPath).output(transcodedVideoPath);
      
      if (JOB_TYPE === "video") {
        f = f.withVideoCodec("libx264")
             .withAudioCodec("aac")
             .format("mp4");
      }
      
      f.withSize(`${width}x${height}`)
        .on("end", async () => {
          // upload the transcoded file to s3
          const fileContent = await fs.readFile(transcodedVideoPath);
          const uploadCommand = new PutObjectCommand({
            Bucket: PRODUCTION_BUCKET_NAME,
            Key: `transcoded-${name}${outExt}`,
            Body: fileContent,
          });
          await s3Client.send(uploadCommand);
          console.log(
            `Transcoded file uploaded to s3 => transcoded-${name}${outExt}`
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
