import * as cdk from "aws-cdk-lib";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import { GW_SNS } from "./gw_SNS";
import { S3_SNS } from "./s3_SNS";

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const snsTopic = new sns.Topic(this, "AstonTopic", {
      displayName: "AstonEmailTopic",
    });
    const subscription = new subs.EmailSubscription("your email");
    snsTopic.addSubscription(subscription);

    new S3_SNS(this, "AstonS3_SNS", {
      downstream: snsTopic,
    });
    new GW_SNS(this, "AstonGW_SNS", {
      downstream: snsTopic,
    });
  }
}
