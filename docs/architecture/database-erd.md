# Database Entity-Relationship Diagram (ERD)

> ⚠️ **Auto-generated file** directly from PostgreSQL ground-truth catalog.
> Run `pnpm db:diagram` to regenerate after migrations.
> Or view directly in browser via: `open docs/architecture/database-erd.html`

```mermaid
erDiagram
    employee ||--o{ asset : "holder_employee_id"
    employee ||--o{ service_request : "employee_id"
    employee ||--o{ service_request : "assigned_to"
    asset ||--o{ service_request : "asset_id"
    legacy_sync_sync_run ||--o{ legacy_sync_staging_employees : "sync_run_id"
    service_request ||--o{ request_history : "request_id"
    employee ||--o{ request_history : "actor_id"
    service_request ||--o{ attachment : "request_id"
    legacy_sync_sync_run ||--o{ legacy_sync_quarantine : "sync_run_id"
    legacy_sync_sync_run ||--o{ legacy_sync_staging_equipment : "sync_run_id"
    legacy_sync_sync_run ||--o{ legacy_sync_staging_requests : "sync_run_id"
    legacy_sync_sync_run ||--o{ legacy_sync_staging_requesthistory : "sync_run_id"
    legacy_sync_sync_run ||--o{ legacy_sync_staging_attachments : "sync_run_id"

    legacy_sync_quarantine {
        uuid id PK
        uuid sync_run_id FK
        text sheet
        int4 row_number
        text legacy_id
        text reason
        jsonb raw
        timestamptz created_at
        text detail
    }
    legacy_sync_row_state {
        text sheet PK
        text legacy_id PK
        text row_hash
    }
    legacy_sync_staging_attachments {
        uuid sync_run_id PK
        int4 row_number PK
        text legacy_id
        text row_hash
        jsonb raw
    }
    legacy_sync_staging_employees {
        uuid sync_run_id PK
        int4 row_number PK
        text legacy_id
        text row_hash
        jsonb raw
    }
    legacy_sync_staging_equipment {
        uuid sync_run_id PK
        int4 row_number PK
        text legacy_id
        text row_hash
        jsonb raw
    }
    legacy_sync_staging_requesthistory {
        uuid sync_run_id PK
        int4 row_number PK
        text legacy_id
        text row_hash
        jsonb raw
    }
    legacy_sync_staging_requests {
        uuid sync_run_id PK
        int4 row_number PK
        text legacy_id
        text row_hash
        jsonb raw
    }
    legacy_sync_sync_run {
        uuid id PK
        timestamptz started_at
        timestamptz finished_at
        text status
        int4 source_rows
        int4 upserted
        int4 unchanged
        int4 quarantined
        jsonb metrics
        timestamptz created_at
        text source
        timestamptz extracted_at
    }
    asset {
        uuid id PK
        text legacy_id
        text type
        text model
        text status
        uuid holder_employee_id FK
        int4 version
        timestamptz created_at
        timestamptz updated_at
    }
    attachment {
        uuid id PK
        text legacy_id
        uuid request_id FK
        text drive_file_id
        text name
        timestamptz created_at
    }
    employee {
        uuid id PK
        text legacy_id
        text name
        text department
        text role
        text email
        timestamptz created_at
        timestamptz updated_at
    }
    request_history {
        uuid id PK
        text legacy_id
        uuid request_id FK
        text from_status
        text to_status
        uuid actor_id FK
        timestamptz occurred_at
        text note
        timestamptz created_at
    }
    service_request {
        uuid id PK
        text legacy_id
        uuid employee_id FK
        text request_type
        text status
        uuid assigned_to FK
        uuid asset_id FK
        int4 version
        timestamptz created_at
        timestamptz updated_at
    }
```

## Summary of Tables

| Schema        | Table Name               | Columns | Foreign Keys |
| :------------ | :----------------------- | :------ | :----------- |
| `legacy_sync` | `quarantine`             | 9       | 1            |
| `legacy_sync` | `row_state`              | 3       | 0            |
| `legacy_sync` | `staging_attachments`    | 5       | 1            |
| `legacy_sync` | `staging_employees`      | 5       | 1            |
| `legacy_sync` | `staging_equipment`      | 5       | 1            |
| `legacy_sync` | `staging_requesthistory` | 5       | 1            |
| `legacy_sync` | `staging_requests`       | 5       | 1            |
| `legacy_sync` | `sync_run`               | 12      | 0            |
| `public`      | `asset`                  | 9       | 1            |
| `public`      | `attachment`             | 6       | 1            |
| `public`      | `employee`               | 8       | 0            |
| `public`      | `request_history`        | 9       | 2            |
| `public`      | `service_request`        | 10      | 3            |
