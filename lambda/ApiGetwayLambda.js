const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const snsClient = new SNSClient({ region: "ap-northeast-1" });

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));
  
  const snsTopicArn = process.env.TOPIC_ARN;
  const message = `From ApiGetway: ${event.body}`;
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
  return {
    "statusCode":200,
    "body":"hello from AWS "
  }
};
