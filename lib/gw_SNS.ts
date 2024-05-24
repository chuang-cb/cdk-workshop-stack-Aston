import * as sns from "aws-cdk-lib/aws-sns";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { RetentionDays, LogGroup } from "aws-cdk-lib/aws-logs";
import { Lambda } from "./lambda";
import { RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";

interface GW_SNSProps {
  downstream: sns.Topic;
}

export class GW_SNS extends Construct {
  constructor(scope: Construct, restApiName: string, props: GW_SNSProps) {
    super(scope, restApiName);

    const handler = new Lambda(
      this,
      "ApiGetwayLambda",
      props.downstream.topicArn
    );
    const resourcePolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["execute-api:Invoke"],
          principals: [new iam.AnyPrincipal()],
          resources: ["execute-api:/*/*/*"],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.DENY,
          actions: ["execute-api:Invoke"],
          principals: [new iam.AnyPrincipal()],
          resources: ["execute-api:/*/*/*"],
          conditions: {
            NotIpAddress: {
              // IP アドレスを指定する
              "aws:SourceIp": ["66.159.200.213"],
            },
          },
        }),
      ],
    });

    const restApi = new apigw.RestApi(this, "AstonApiMailEndpoint", {
      restApiName: "Aston API",
      description: "Aston sample API",
      policy: resourcePolicy,
      // defaultCorsPreflightOptions: {
      //   allowOrigins: ["https://example.com"],
      //   allowMethods: ["GET", "POST"], // GETとPOSTのみ許可
      // },
      deployOptions: {
        accessLogDestination: new apigw.LogGroupLogDestination(
          new LogGroup(scope, "AstonApiGatewayLogGroup", {
            // logGroupName: "api-gateway-logs",
            retention: RetentionDays.ONE_DAY,
            removalPolicy: RemovalPolicy.DESTROY,
          })
        ),
      },
    });

    restApi.addGatewayResponse("Default4xx", {
      type: apigw.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Headers": "'*'",
      },
      templates: {
        "application/json": '{"message":$context.error.messageString}',
      },
    });

    restApi.addGatewayResponse("Default5xx", {
      type: apigw.ResponseType.DEFAULT_5XX,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Headers": "'*'",
      },
      templates: {
        "application/json": '{"message":$context.error.messageString}',
      },
    });

    const postModel = new apigw.Model(this, "post-validator", {
      restApi: restApi,
      contentType: "application/json",
      description: "To validate the request body",
      schema: {
        type: apigw.JsonSchemaType.OBJECT,
        required: ["content"],
        properties: {
          content: {
            type: apigw.JsonSchemaType.STRING,
            minLength: 1,
            maxLength: 1024,
          },
        },
      },
    });

    const getResource = restApi.root.addResource("resource");
    getResource.addMethod("POST", new apigw.LambdaIntegration(handler), {
      requestModels: {
        "application/json": postModel,
      },
      requestValidatorOptions: {
        validateRequestBody: true,
      },
    });

    getResource.addMethod("GET", new apigw.LambdaIntegration(handler));

    props.downstream.grantPublish(handler);
  }
}
