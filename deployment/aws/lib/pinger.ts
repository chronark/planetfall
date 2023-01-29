import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import { RemovalPolicy } from "aws-cdk-lib";
import { Capability } from "aws-cdk-lib/aws-ecs";


export class Pinger extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    // const vpc = new ec2.Vpc(this, 'Vpc', { maxAzs: 2 });
    const cluster = new ecs.Cluster(this, "pinger-cluster")


    const taskDefinition = new ecs.FargateTaskDefinition(this, "pinger-task", {
      cpu: 256,
      

    })

    

    taskDefinition.addContainer("pinger", {
      containerName: "pinger",
      image: ecs.ContainerImage.fromRegistry("planetfall-pinger"),
    })



    // const service = new ecs.FargateService(this, "pinger-service", {
    //   cluster,
    //   taskDefinition,
    //   assignPublicIp: false,
    //   desiredCount: 1,
    //   serviceName: "pinger",
    // })



    // const s = new ecsPatterns.ApplicationLoadBalancedFargateService(this, "scheduler-service", {
    //   cluster,

    //   taskImageOptions: {
    //     image: ecs.ContainerImage.fromRegistry("planetfall-scheduler"),
    //   }
    // })


  }
}
