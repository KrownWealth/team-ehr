#!/bin/bash

# Script to check Cloud Run logs for debugging

echo "📋 Fetching Cloud Run logs..."
echo ""

# Get the latest revision
REVISION=$(gcloud run revisions list \
  --service=wecareehr-backend \
  --region=africa-south1 \
  --format="value(name)" \
  --limit=1)

echo "Latest revision: $REVISION"
echo ""

# Get logs from the last 5 minutes
echo "=== Container Logs (last 5 minutes) ==="
gcloud logging read "resource.type=cloud_run_revision
resource.labels.service_name=wecareehr-backend
resource.labels.revision_name=$REVISION
timestamp>\"$(date -u -d '5 minutes ago' '+%Y-%m-%dT%H:%M:%SZ')\"" \
  --limit=100 \
  --format=json \
  --project=team-ehr | jq -r '.[] | .textPayload // .jsonPayload.message // empty'

echo ""
echo "=== Error Logs ==="
gcloud logging read "resource.type=cloud_run_revision
resource.labels.service_name=wecareehr-backend
resource.labels.revision_name=$REVISION
severity>=ERROR
timestamp>\"$(date -u -d '5 minutes ago' '+%Y-%m-%dT%H:%M:%SZ')\"" \
  --limit=50 \
  --format=json \
  --project=team-ehr | jq -r '.[] | .textPayload // .jsonPayload.message // empty'

echo ""
echo "=== Service Status ==="
gcloud run services describe wecareehr-backend \
  --region=africa-south1 \
  --format="table(
    status.conditions.type,
    status.conditions.status,
    status.conditions.message
  )"

echo ""
echo "=== Latest Revision Status ==="
gcloud run revisions describe $REVISION \
  --region=africa-south1 \
  --format="table(
    status.conditions.type,
    status.conditions.status,
    status.conditions.message
  )"