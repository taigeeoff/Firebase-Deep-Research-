ifneq (,$(wildcard .env.local))
    include .env.local
    export
endif

# Create environment variables YAML file from .env file
deployment.yaml: .env.local
	@echo "# Generated from .env.$(ENV)" > $@
	@grep -v '^#' $< | grep -v '^$$' | sed 's/^/  /' | sed 's/=/: /' >> $@

# Display contents of the yaml file
verify_yaml: deployment.yaml
	@echo "ENV: deployment"


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
		
deploy: verify_yaml
	gcloud run deploy ce-intern-fe-service \
		--image ${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/ce-intern-repo/ce_intern_image:latest \
		--region ${GCP_REGION} \
		--allow-unauthenticated \
		--env-vars-file=deployment.yaml

traffic:
	gcloud run services update-traffic ce-intern-fe-service --to-latest

clean:
	rm -f deployment.yaml

all: config init build deploy traffic clean