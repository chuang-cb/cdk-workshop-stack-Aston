import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class Lambda extends lambda.Function {
  constructor(scope: Construct, filename: string, TOPIC_ARN: string) {
    super(scope, filename, {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: `${filename}.handler`,
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        TOPIC_ARN,
      },
    });
  }
}
