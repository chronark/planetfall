


deploy-scheduler:
	aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 750095769533.dkr.ecr.us-east-1.amazonaws.com
	docker build -t planetfall/scheduler -f=svc/scheduler/Dockerfile .
	docker tag planetfall/scheduler:latest 750095769533.dkr.ecr.us-east-1.amazonaws.com/planetfall/scheduler:latest
	docker push 750095769533.dkr.ecr.us-east-1.amazonaws.com/planetfall/scheduler:latest