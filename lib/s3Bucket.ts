import * as s3bucket from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class S3B extends s3bucket.Bucket {
  constructor(scope: Construct, bucketName: string) {
    super(scope, bucketName, {
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
