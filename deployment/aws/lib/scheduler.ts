import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import { RemovalPolicy } from "aws-cdk-lib";
import { Capability, TaskDefinition } from "aws-cdk-lib/aws-ecs";
import { compileFunction } from "vm";


export class Scheduler extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const repository = new ecr.Repository(this, "planetfall-scheduler", {
      repositoryName: "scheduler",
      lifecycleRules: [{ maxImageAge: cdk.Duration.days(7) }],
      removalPolicy: RemovalPolicy.DESTROY,
      imageTagMutability: ecr.TagMutability.IMMUTABLE
    })

    // const vpc = new ec2.Vpc(this, 'Vpc', { maxAzs: 2 });
    const cluster = new ecs.Cluster(this, "scheduler-cluster", {
      clusterName: "scheduler"

    })
    cluster.addCapacity("scheduler-capacity", {
      instanceType: new ec2.InstanceType("t3.nano"),
    })


    const taskDefinition = new ecs.FargateTaskDefinition(this, "scheduler-task-definition", {
      family: "scheduler",
      memoryLimitMiB: 512,
      cpu: 256,
      ephemeralStorageGiB: 0




    })


    const container = taskDefinition.addContainer("scheduler", {
      containerName: "scheduler",
      image: ecs.ContainerImage.fromEcrRepository(repository, "latest"),
    })
    container.addEnvironment("X", "Y")



    const service = new ecs.FargateService(this, "scheduler-service", {
      cluster,
      taskDefinition,
      assignPublicIp: false,
      desiredCount: 1,
      serviceName: "scheduler",
    })



    // const s = new ecsPatterns.ApplicationLoadBalancedFargateService(this, "scheduler-service", {
    //   cluster,

    //   taskImageOptions: {
    //     image: ecs.ContainerImage.fromRegistry("planetfall-scheduler"),
    //   }
    // })


  }
}
