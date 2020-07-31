IMAGENAME = gcr.io/laputa/github-stats

ENVS = $(shell cat .env | tr '\n' ',')

.PHONY: build deploy

build:
	gcloud builds submit --project laputa --tag $(IMAGENAME)

deploy: build
	gcloud beta run \
		deploy github-stats \
		--region us-central1 \
		--platform managed \
		--concurrency 1 \
		--max-instances 1 \
		--memory 256Mi \
		--timeout 1m \
		--set-env-vars $(ENVS) \
		--image $(IMAGENAME) \
		--project laputa
