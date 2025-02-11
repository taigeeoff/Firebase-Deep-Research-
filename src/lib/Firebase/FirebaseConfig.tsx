import { Firestore } from "@google-cloud/firestore";

const db = new Firestore({
  projectId: process.env.GCP_PROJECT_ID,
});

export { db };