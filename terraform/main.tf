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
    "orgpolicy.googleapis.com",
    "cloudtrace.googleapis.com" # Added Cloud Trace API
  ])

  service = each.key
  disable_dependent_services = true
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
  depends_on    = [google_project_service.required_apis]
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

# Get the default compute service account
data "google_compute_default_service_account" "default" {
  project = var.project_id
}

# Grant Cloud Trace Agent role to the default compute service account
resource "google_project_iam_member" "compute_trace_agent" {
  project = var.project_id
  role    = "roles/cloudtrace.agent"
  member  = "serviceAccount:${data.google_compute_default_service_account.default.email}"
  depends_on = [google_project_service.required_apis] # Ensure Trace API is enabled first
}
