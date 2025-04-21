ifneq (,$(wildcard .env.local))
    include .env.local
    export
endif


config:
	gcloud config set project ${GCP_PROJECT_ID}
	gcloud config set ai/region ${GCP_REGION}
	gcloud config set run/region ${GCP_REGION}
	gcloud config set artifacts/location ${GCP_REGION}

init:
	gcloud services enable {storage,compute,run,cloudbuild,artifactregistry}.googleapis.com

build:
	gcloud builds submit . \
		--tag ${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/ce-intern-repo/ce_intern_image:latest
		
deploy:
	gcloud run deploy ce-intern-fe-service \
		--image ${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/ce-intern-repo/ce_intern_image:latest \
		--region ${GCP_REGION} \
		--allow-unauthenticated

traffic:
	gcloud run services update-traffic ce-intern-fe-service --to-latest

all: config init build deploy traffics