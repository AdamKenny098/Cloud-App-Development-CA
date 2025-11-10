import * as cdk from "aws-cdk-lib";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as custom from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { generateBatch } from "../shared/util";
import { movies, casts, actors, awards } from "../seed/movies";
import * as apig from "aws-cdk-lib/aws-apigateway";
import { Aws } from "aws-cdk-lib";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";
import * as node from "aws-cdk-lib/aws-lambda-nodejs";
import { AuthApi } from './constructs/auth-api'
import {AppApi } from './constructs/app-api'
export class CloudAppDevelopmentCaStack extends cdk.Stack {

  private userPoolId: string;
  private userPoolClientId: string;
  
  

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    

    const userPool = new UserPool(this, "UserPool", {
      signInAliases: { username: true, email: true },
      selfSignUpEnabled: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.userPoolId = userPool.userPoolId;

    const appClient = userPool.addClient("AppClient", {
      authFlows: { userPassword: true },
    });

    this.userPoolClientId = appClient.userPoolClientId;

    const authorizerFn = new node.NodejsFunction(this, "AppApiAuthorizerFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: `${__dirname}/../lambdas/auth/authorizer.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        USER_POOL_ID: this.userPoolId,
        CLIENT_ID: this.userPoolClientId,
        REGION: cdk.Aws.REGION,
      },
    });

    const requestAuthorizer = new apig.RequestAuthorizer(this, "AppApiRequestAuthorizer", {
      handler: authorizerFn,
      identitySources: [apig.IdentitySource.header("cookie")],
      resultsCacheTtl: cdk.Duration.seconds(0),
    });

    
    new AuthApi(this, 'AuthServiceApi', {
      userPoolId: this.userPoolId,
      userPoolClientId: this.userPoolClientId,
    });

    new AppApi(this, 'AppApi', {
      userPoolId: this.userPoolId,
      userPoolClientId: this.userPoolClientId,
    } );

    const entityTable = new dynamodb.Table(this, "EntityTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new custom.AwsCustomResource(this, "EntityTableInitData", {
      onCreate: {
        service: "DynamoDB",
        action: "batchWriteItem",
        parameters: {
          RequestItems: {
            [entityTable.tableName]: generateBatch([
              ...movies,
              ...actors,
              ...casts,
              ...awards,
            ]),
          },
        },
        physicalResourceId: custom.PhysicalResourceId.of("EntityTableInitData"),
      },
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [entityTable.tableArn],
      }),
    });

    // Functions
    const newMovieFn = new lambdanode.NodejsFunction(this, "AddMovieFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: `${__dirname}/../lambdas/addMovie.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        TABLE_NAME: entityTable.tableName,
        REGION: cdk.Aws.REGION,
      },
    });

    const getMovieByIdFn = new lambdanode.NodejsFunction(
      this,
      "GetMovieByIdFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: `${__dirname}/../lambdas/getMovieById.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: entityTable.tableName,
          REGION: cdk.Aws.REGION,
        },
      },
    );

    const getAllMoviesFn = new lambdanode.NodejsFunction(
      this,
      "GetAllMoviesFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: `${__dirname}/../lambdas/getAllMovies.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: entityTable.tableName,
          REGION: cdk.Aws.REGION,
        },
      },
    );

    const deleteMovieByIdFn = new lambdanode.NodejsFunction(
      this,
      "DeleteMovieByIdFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: `${__dirname}/../lambdas/deleteMovieById.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: entityTable.tableName,
          REGION: cdk.Aws.REGION,
        },
      },
    );

    const getMovieCastMembersFn = new lambdanode.NodejsFunction(
      this,
      "GetCastMemberFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: `${__dirname}/../lambdas/getMovieCastMember.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: entityTable.tableName,
          REGION: cdk.Aws.REGION,
        },
      },
    );

    const getActorByMovieFn = new lambdanode.NodejsFunction(
      this,
      "GetActorByMovieFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: `${__dirname}/../lambdas/getActorByMovie.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: entityTable.tableName,
          REGION: cdk.Aws.REGION,
        },
      },
    );

    const getCastMemberByIdFn = new lambdanode.NodejsFunction(
      this,
      "GetCastMemberByIdFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: `${__dirname}/../lambdas/getActorById.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: entityTable.tableName,
          REGION: cdk.Aws.REGION,
        },
      },
    );

    const getAwardsFn = new lambdanode.NodejsFunction(this, "GetAwardsFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: `${__dirname}/../lambdas/getAwards.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        TABLE_NAME: entityTable.tableName,
        REGION: cdk.Aws.REGION,
      },
    });

    // Permissions
    entityTable.grantReadData(getMovieByIdFn);
    entityTable.grantReadData(getAllMoviesFn);
    entityTable.grantReadWriteData(newMovieFn);
    entityTable.grantReadWriteData(deleteMovieByIdFn);
    entityTable.grantReadData(getMovieCastMembersFn);
    entityTable.grantReadData(getActorByMovieFn);
    entityTable.grantReadData(getCastMemberByIdFn);
    entityTable.grantReadData(getAwardsFn);

    //Rest API
    const api = new apig.RestApi(this, "CloudAppCaStack", {
      description: "demo api",
      deployOptions: {
        stageName: "dev",
      },
      defaultCorsPreflightOptions: {
        allowHeaders: ["Content-Type", "X-Amz-Date"],
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
        allowCredentials: true,
        allowOrigins: ["*"],
      },
    });

    const moviesEndpoint = api.root.addResource("movies");
    moviesEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getAllMoviesFn, { proxy: true }),
    );

    moviesEndpoint.addMethod(
      "POST",
      new apig.LambdaIntegration(newMovieFn, { proxy: true }),
    );

    const movieEndpoint = moviesEndpoint.addResource("{movieId}");
    movieEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getMovieByIdFn, { proxy: true }),
      {
        authorizer: requestAuthorizer,
        authorizationType: apig.AuthorizationType.CUSTOM,
      },
    );
    movieEndpoint.addMethod(
      "DELETE",
      new apig.LambdaIntegration(deleteMovieByIdFn, { proxy: true }),
    );

    const movieCastEndpoint = moviesEndpoint.addResource("cast");
    movieCastEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getMovieCastMembersFn, { proxy: true }),
    );

    const movieActorsEndpoint = movieEndpoint.addResource("actors");
    movieActorsEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getActorByMovieFn, { proxy: true }),
    );

    const specificActorEndpoint = movieActorsEndpoint.addResource("{actorId}");
    specificActorEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getCastMemberByIdFn, { proxy: true }),
    );

    const awardsEndpoint = api.root.addResource("awards");
    awardsEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getAwardsFn, { proxy: true }),
    );
  }
}
