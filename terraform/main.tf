terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "artifactregistry.googleapis.com",
    "run.googleapis.com",
    "firestore.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "aiplatform.googleapis.com",
    "cloudbuild.googleapis.com",
    "orgpolicy.googleapis.com"
  ])
  
  service = each.key
  disable_dependent_services = true
}

# Disable Organization Policies
resource "google_org_policy_policy" "disable_allowed_policy_member_domains" {
  name   = "projects/${var.project_id}/policies/iam.allowedPolicyMemberDomains"
  parent = "projects/${var.project_id}"

  spec {
    rules {
      allow_all = "TRUE"
    }
  }
  depends_on    = [google_project_service.required_apis]
}

resource "google_org_policy_policy" "enable_sa_key_creation" {
  name   = "projects/${var.project_id}/policies/iam.disableServiceAccountKeyCreation"
  parent = "projects/${var.project_id}"

  spec {
    rules {
      enforce = "FALSE"
    }
  }
  depends_on    = [google_project_service.required_apis]
}

# Service Account for the application
resource "google_service_account" "app_service_account" {
  account_id   = "ce-intern-app-sa"
  display_name = "CE Intern Application Service Account"
}

# Grant necessary roles to the service account
resource "google_project_iam_member" "app_sa_roles" {
  for_each = toset([
    "roles/datastore.user",
    "roles/artifactregistry.reader",
    "roles/storage.admin",
    "roles/aiplatform.user"
  ])
  
  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.app_service_account.email}"
}

# Grant necessary roles to the default compute sa
resource "google_project_iam_member" "default_compute_roles" {
  for_each = toset([
    "roles/storage.admin",
    "roles/logging.logWriter",
    "roles/artifactregistry.writer"
  ])
  
  project = var.project_id
  role    = each.key
  member = "serviceAccount:350463476222-compute@developer.gserviceaccount.com"
}

# Artifact Registry Repository
resource "google_artifact_registry_repository" "app_repository" {
  location      = var.region
  repository_id = "ce-intern-repo"
  description   = "Docker repository for CE intern application"
  format        = "DOCKER"
  depends_on    = [google_project_service.required_apis]
}

# Firestore Instance
resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
  depends_on  = [google_project_service.required_apis]
}

# Firestore Vector Index
resource "google_firestore_index" "chunk-vector-index" {
  project     = var.project_id
  database   = google_firestore_database.database.name
  collection = "chunks"

  fields {
    field_path = "__name__"
    order      = "ASCENDING"
  }

  fields {
    field_path = "embedding"
    vector_config {
      dimension = 768
      flat {}
    }
  }
  depends_on  = [google_firestore_database.database]
}

## Cloud Run Service
#resource "google_cloud_run_v2_service" "webserver" {
#  name     = "ce-intern-fe-service"
#  location = var.region
#  
#  template {
#    service_account = google_service_account.app_service_account.email
#    containers {
#      image = "${var.region}-docker.pkg.dev/${var.project_id}/ce-intern-repo/ce_intern_image:latest"
#      
#      env {
#        name  = "NODE_ENV"
#        value = "production"
#      }
#
#      env {
#        name  = "GCP_PROJECT_ID"
#        value = var.project_id
#      }
#
#      env {
#        name  = "GCP_REGION"
#        value = var.region
#      }
#
#      ports {
#        container_port = 8080
#      }
#    }
#  }
#
#  depends_on = [
#    google_artifact_registry_repository.app_repository,
#    google_firestore_database.database
#  ]
#}
#
## IAM policy for Cloud Run service
#resource "google_cloud_run_service_iam_member" "public_access" {
#  location = google_cloud_run_v2_service.webserver.location
#  service  = google_cloud_run_v2_service.webserver.name
#  role     = "roles/run.invoker"
#  member   = "allUsers"
#  depends_on = [
#    google_cloud_run_v2_service.webserver,
#  ]
#}