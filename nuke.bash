#!/bin/bash



for region in "us-east-2" "us-east-1" "us-west-1" "us-west-2" "af-south-1" "ap-east-1" "ap-south-2" "ap-southeast-3" "ap-south-1" "ap-northeast-3" "ap-northeast-2" "ap-southeast-1" "ap-southeast-2" "ap-northeast-1" "ca-central-1" "eu-central-1" "eu-west-1" "eu-west-2" "eu-south-1" "eu-west-3" "eu-south-2" "eu-north-1" "eu-central-2" "me-south-1" "me-central-1" "sa-east-1" "us-gov-east-1" "us-gov-west-1";
    do echo ${region}

    aws cloudformation list-stacks | jq -c '.[] | map(.StackName) | .[]' | while read stack; do

    
      echo ${stack} && aws --region=${region} cloudformation delete-stack --stack-name ${stack}
    done





    for bucket in $(aws s3 ls | awk '{print $3}' );
        do  echo ${bucket} && aws --region=${region} s3 rm "s3://${bucket}" --recursive && aws s3 rb "s3://${bucket}" --force
    done
done
