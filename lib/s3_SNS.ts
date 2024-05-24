import * as s3bucket from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib";
import * as sns from "aws-cdk-lib/aws-sns";
import { S3B } from "./s3Bucket";
import { Lambda } from "./lambda";
import { Construct } from "constructs";

interface S3_SNSProps {
  downstream: sns.Topic;
}

export class S3_SNS extends Construct {
  constructor(scope: Construct, bucketName: string, props: S3_SNSProps) {
    super(scope, bucketName);

    const handler = new Lambda(
      this,
      "S3EventLambda",
      props.downstream.topicArn
    );
    const bucket = new S3B(this, "Astons3Bucket");
    handler.addEventSource(
      new cdk.aws_lambda_event_sources.S3EventSource(bucket, {
        events: [s3bucket.EventType.OBJECT_CREATED],
      })
    );
    // bucket.grantRead(handler);
    props.downstream.grantPublish(handler);
  }
}
