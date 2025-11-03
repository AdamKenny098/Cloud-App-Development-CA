#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CloudAppDevelopmentCaStack } from "../lib/cloud-app-development-ca-stack";

const app = new cdk.App();
new CloudAppDevelopmentCaStack(app, "RestAPIStack", { env: { region: "eu-west-1" } });
