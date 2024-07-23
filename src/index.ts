import { ReceiveMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { S3Event } from "aws-lambda";
const client = new SQSClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "AKIATL2EBYAWXY3CHTNB",
    secretAccessKey:
      process.env.AWS_SECRET_ACCESS_KEY ||
      "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",
  },
});

/**
 * This function is the entry point for consumer.
 * 1. It will get the message from the SQS queue and process it.
 * 2. Download the file from the S3 bucket.
 * 3. Spin up the docket container.
 * 4. Delete the message from the SQS queue.
 *
 */

const init = async () => {
  console.log("Consumer started");
  try {
    const command = new ReceiveMessageCommand({
      QueueUrl:
        process.env.SQS_QUEUE_URL ||
        "https://sqs.us-east-1.amazonaws.com/231534084141/video-transcoder-s3-queue",
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 20,
    });

    while (true) {
      const { Messages } = await client.send(command);
      if (!Messages) {
        console.log("No messages in the queue");
        continue;
      }

      for (const message of Messages) {
        console.log("Message", message);
        const { MessageId, Body } = message;
        console.log("Message Received MessageId", MessageId);
        if (!Body) {
          console.log("No Body in the message");
          continue;
        }
        // validate the message
        const event = JSON.parse(Body) as S3Event;
        if ("Service" in event && "Event" in event) {
          if (event.Event === "s3:TestEvent") {
            console.log("Test Event");
            continue;
          }
        }
        for (const record of event.Records) {
          const { s3 } = record;
          const {
            bucket,
            object: { key },
          } = s3;
          // spin up the docker container
        }
        // download the file from the S3 bucket
        // delete the message from the SQS queue
      }
    }
  } catch (err) {
    console.log("Error", err);
  }
};

init();
