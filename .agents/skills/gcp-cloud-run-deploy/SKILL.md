---
name: gcp-cloud-run-deploy
description: Use this skill when deploying, rolling back, or configuring the api, web, migrate job, or legacy-sync job on GCP (Cloud Run, Cloud SQL, Cloud Scheduler, Secret Manager, Artifact Registry), or when editing the GitHub Actions deploy workflow.
---

# Deploying to GCP

Read first: rule `infra-gcp`. Normal path is CI on merge to `main`; manual
steps below are for first-time setup, hotfixes, and rollback.

## Variables

```bash
PROJECT=<gcp-project>  REGION=asia-southeast1
REPO=$REGION-docker.pkg.dev/$PROJECT/clt-erp
SQL_INSTANCE=$PROJECT:$REGION:clt-erp-pg
SHA=$(git rev-parse --short HEAD)
```

## Release order (never change it)

1. Build & push images `api`, `web` tagged `$SHA`.
2. Run migrations **before** new code:
   ```bash
   gcloud run jobs update migrate --image $REPO/api:$SHA --region $REGION \
     --set-cloudsql-instances $SQL_INSTANCE --command node --args dist/migrate.js
   gcloud run jobs execute migrate --region $REGION --wait
   ```
3. Deploy services:
   ```bash
   gcloud run deploy api --image $REPO/api:$SHA --region $REGION \
     --set-cloudsql-instances $SQL_INSTANCE --service-account api-sa@$PROJECT.iam.gserviceaccount.com \
     --set-secrets DATABASE_PASSWORD=db-password:latest,FIREBASE_PROJECT_ID=firebase-project-id:latest
   gcloud run deploy web --image $REPO/web:$SHA --region $REGION
   ```
4. Update sync job image: `gcloud run jobs update legacy-sync --image $REPO/api:$SHA ...`.

## Verify

- `curl -fsS https://<api-url>/readyz` returns 200.
- Cloud Logging: no `severity>=ERROR` spike for 10 min.
- Trigger one sync: `gcloud run jobs execute legacy-sync --region $REGION --wait`
  and check the latest `sync_run` report has 0 unexpected quarantines.

## Rollback

- Code: `gcloud run services update-traffic api --to-revisions <prev-rev>=100 --region $REGION`.
- Schema: only if the migration is not backward compatible (should not happen —
  expand/contract). Otherwise leave schema, roll back code only.

## Never

- Run migrations from the api container on startup.
- Use service-account JSON keys in CI (use Workload Identity Federation).
- Deploy from a dirty working tree.
