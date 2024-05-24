const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const snsClient = new SNSClient({ region: "ap-northeast-1" });

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));
  
  const snsTopicArn = process.env.TOPIC_ARN;
  const message = `New file uploaded: ${event.Records[0].s3.object.key}`;

  const command = new PublishCommand({
    Message: message,
    TopicArn: snsTopicArn,
  });

  try {
    const response = await snsClient.send(command);
    console.log("Message published:", response);
  } catch (err) {
    console.error("Error publishing message:", err);
  }
};
