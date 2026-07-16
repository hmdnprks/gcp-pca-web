// GCP Professional Cloud Architect — Reference Architecture patterns.
//
// The exam rewards *systems thinking*: recognizing that a scenario ("real-time
// ingestion, transform, land in a warehouse, archive raw data") maps to a
// canonical pipeline of services rather than one service in isolation. Each
// pattern below is an end-to-end flow (staged left→right) plus the use cases,
// exam trigger phrases, and pitfalls that tell you when to reach for it.

/** One box in a pipeline stage. `id` (when it resolves in SERVICE_INDEX) makes
 *  the chip clickable and gives it the service icon; otherwise it renders as a
 *  static reference chip using `label`. */
export interface ArchNode {
  /** Service id in SERVICE_INDEX. */
  id?: string;
  /** Display label; defaults to the service name when `id` resolves. */
  label?: string;
}

/** A stage in the flow, e.g. "Ingest", "Process", "Serve", "Archive". */
export interface ArchStage {
  label: string;
  /** One line: what happens at this stage and why. */
  role: string;
  nodes: ArchNode[];
}

/** A swap that turns this pattern into a close cousin. */
export interface ArchVariant {
  when: string;
  swap: string;
}

export type ArchCategory =
  | "data"
  | "compute"
  | "networking"
  | "migration"
  | "ml"
  | "reliability";

export interface ArchPattern {
  id: string;
  name: string;
  tagline: string;
  category: ArchCategory;
  /** Lucide icon key (see lib/icons.ts). */
  icon: string;
  /** The problem this architecture solves — the "when to reach for it". */
  problem: string;
  /** The end-to-end flow, one entry per stage. */
  stages: ArchStage[];
  /** Concrete scenarios that demand this architecture. */
  useCases: string[];
  /** Trigger phrases in a question that point here. */
  examTriggers: string[];
  /** Common wrong turns / gotchas. */
  pitfalls: string[];
  /** Small changes that morph this into a related pattern. */
  variants?: ArchVariant[];
  /** Official case studies where this pattern shows up (caseStudies.ts ids). */
  caseStudies?: string[];
}

export const ARCH_CATEGORIES: Record<
  ArchCategory,
  { label: string; accent: string }
> = {
  data: { label: "Data & Analytics", accent: "cyan" },
  compute: { label: "Compute & App", accent: "emerald" },
  networking: { label: "Networking & Landing Zone", accent: "sky" },
  migration: { label: "Migration", accent: "amber" },
  ml: { label: "AI / ML", accent: "fuchsia" },
  reliability: { label: "Reliability & DR", accent: "rose" },
};

export const ARCHITECTURES: ArchPattern[] = [
  {
    id: "streaming-analytics",
    name: "Real-time streaming analytics",
    tagline: "Pub/Sub → Dataflow → BigQuery (+ archive to Cloud Storage)",
    category: "data",
    icon: "dataflow",
    problem:
      "Ingest a high, spiky volume of events as they happen, transform/enrich them in flight, land them in a warehouse for near-real-time analytics, and keep the raw stream cheaply for replay and compliance.",
    stages: [
      {
        label: "Ingest",
        role: "Durable, decoupled buffer that absorbs spikes and fans out to consumers.",
        nodes: [{ id: "pubsub" }],
      },
      {
        label: "Process",
        role: "Serverless Apache Beam streaming: windowing, dedup, enrichment, aggregation.",
        nodes: [{ id: "dataflow" }],
      },
      {
        label: "Analyze & serve",
        role: "Streaming inserts into a columnar warehouse; dashboards on top.",
        nodes: [{ id: "bigquery" }, { id: "looker" }],
      },
      {
        label: "Archive",
        role: "Land raw events in cheap object storage for replay & long-term retention.",
        nodes: [{ id: "cloud-storage" }],
      },
    ],
    useCases: [
      "Clickstream, IoT telemetry, or fraud signals where insight is needed within seconds.",
      "A retailer capturing store + web events for live inventory and personalization.",
      "High-throughput log/metric analytics feeding real-time dashboards.",
    ],
    examTriggers: [
      "\"real-time\" / \"streaming\" / \"as events arrive\" / \"within seconds\"",
      "\"millions of events per second\", \"decouple producers from consumers\" → Pub/Sub",
      "\"serverless transformation\" / \"windowed aggregation\" → Dataflow",
      "\"SQL analytics over huge datasets\" / \"data warehouse\" → BigQuery",
    ],
    pitfalls: [
      "Dataproc is for existing Spark/Hadoop — for greenfield serverless streaming use Dataflow.",
      "Don't write events straight to BigQuery without Pub/Sub — you lose buffering/decoupling under spikes.",
      "Rarely-read compliance copies belong in Cloud Storage Coldline/Archive, not Nearline or BigQuery.",
    ],
    variants: [
      {
        when: "You have existing Spark/Hadoop jobs to reuse",
        swap: "Swap Dataflow → Dataproc",
      },
      {
        when: "The workload is batch, not real-time",
        swap: "Swap Pub/Sub ingest → scheduled Cloud Storage loads orchestrated by Composer",
      },
      {
        when: "You also need low-latency key lookups on the processed data",
        swap: "Add Bigtable alongside BigQuery for single-digit-ms serving",
      },
    ],
    caseStudies: ["cymbal", "altostrat"],
  },
  {
    id: "batch-etl-lake",
    name: "Batch ETL / data-lake pipeline",
    tagline: "Cloud Storage → Composer-orchestrated Dataflow/Dataproc → BigQuery",
    category: "data",
    icon: "composer",
    problem:
      "Periodically load large datasets from many sources into a lake/warehouse, transform them in scheduled batches, and orchestrate the dependencies between jobs reliably (with retries and backfills).",
    stages: [
      {
        label: "Land",
        role: "Raw files land in a data-lake / landing zone in object storage.",
        nodes: [{ id: "cloud-storage" }],
      },
      {
        label: "Orchestrate",
        role: "Managed Airflow DAGs schedule and sequence the jobs with retries.",
        nodes: [{ id: "composer" }],
      },
      {
        label: "Process",
        role: "Batch transforms — Dataflow for new unified code, Dataproc to rehost Spark/Hadoop.",
        nodes: [{ id: "dataflow" }, { id: "dataproc" }],
      },
      {
        label: "Warehouse & BI",
        role: "Curated tables for analytics, surfaced through BI.",
        nodes: [{ id: "bigquery" }, { id: "looker" }],
      },
    ],
    useCases: [
      "Nightly consolidation of ERP/CRM/on-prem exports into a warehouse.",
      "Migrating an on-prem Hadoop/Spark data lake to Google Cloud.",
      "Scheduled regulated reporting with dependencies between steps.",
    ],
    examTriggers: [
      "\"nightly\" / \"scheduled\" / \"batch\" processing",
      "\"orchestrate dependencies between jobs\" / \"workflow\" → Cloud Composer (Airflow)",
      "\"data lake\" / \"landing zone\" → Cloud Storage",
      "\"migrate existing Spark/Hadoop\" → Dataproc",
    ],
    pitfalls: [
      "Don't hand-roll cron on a VM to orchestrate — use Composer for managed Airflow (retries, backfills).",
      "Dataproc for lift-and-shift of existing Spark; Dataflow for new unified batch+stream pipelines.",
      "Data Fusion is the low-code visual-ETL alternative when the team prefers no-code over Beam.",
    ],
    variants: [
      {
        when: "The team wants low-code visual ETL instead of writing Beam",
        swap: "Swap Dataflow → Cloud Data Fusion",
      },
      {
        when: "You also need real-time paths",
        swap: "Add the streaming-analytics flow feeding the same BigQuery warehouse",
      },
    ],
    caseStudies: ["cymbal"],
  },
  {
    id: "scalable-web-app",
    name: "Global, scalable web application",
    tagline: "Global LB + Cloud CDN + Cloud Armor → autoscaled compute → managed DB",
    category: "compute",
    icon: "cloud-lb",
    problem:
      "Serve a stateless web/app tier globally behind a single anycast IP, cache static content at the edge, absorb traffic spikes with autoscaling, protect against L7/DDoS attacks, and back it with a managed database and cache.",
    stages: [
      {
        label: "Edge",
        role: "Single global IP, edge caching, and WAF/DDoS protection.",
        nodes: [
          { id: "cloud-lb", label: "Global External HTTPS LB" },
          { id: "cloud-cdn" },
          { id: "cloud-armor" },
        ],
      },
      {
        label: "Compute",
        role: "Stateless, autoscaled tier — a managed instance group, GKE, or Cloud Run.",
        nodes: [
          { id: "gce", label: "Managed Instance Group" },
          { id: "gke" },
          { id: "cloud-run" },
        ],
      },
      {
        label: "Cache",
        role: "In-memory store for sessions and hot data so instances stay stateless.",
        nodes: [{ id: "memorystore" }],
      },
      {
        label: "Data",
        role: "Managed relational backend — Cloud SQL regionally, Spanner for global scale.",
        nodes: [{ id: "cloud-sql" }, { id: "spanner" }],
      },
    ],
    useCases: [
      "Public storefront that must handle spikes and shrug off DDoS.",
      "Multi-region app needing one anycast IP and low latency for global users.",
      "Media/site delivery where static assets should be cached near users.",
    ],
    examTriggers: [
      "\"single global IP\" / \"anycast\" → Global External HTTPS LB",
      "\"cache static content near users\" → Cloud CDN",
      "\"protect from DDoS / OWASP / SQL injection\" → Cloud Armor",
      "\"autoscale\" / \"stateless\" → managed instance group / Cloud Run / GKE",
      "\"global, strongly-consistent relational\" → Spanner",
    ],
    pitfalls: [
      "A regional load balancer can't give a single global IP — use the global external HTTPS LB.",
      "Never store session state on the instances — it breaks autoscaling; put it in Memorystore.",
      "Cloud SQL is regional; if the requirement is horizontal global scale with strong consistency, use Spanner.",
    ],
    variants: [
      {
        when: "You need global horizontal-scale relational data",
        swap: "Swap Cloud SQL → Spanner",
      },
      {
        when: "The app is containerized microservices",
        swap: "Swap the MIG → GKE or Cloud Run",
      },
    ],
    caseStudies: ["altostrat", "knightmotives"],
  },
  {
    id: "event-driven",
    name: "Event-driven microservices",
    tagline: "Pub/Sub + Eventarc → Cloud Run / Functions (scale to zero) → Firestore",
    category: "compute",
    icon: "pubsub",
    problem:
      "Decouple services so they react to events asynchronously, scale to zero when idle, and respond to GCP resource events (a file lands, a row is written) without polling.",
    stages: [
      {
        label: "Event bus",
        role: "Durable async messaging that fans out and buffers backpressure.",
        nodes: [{ id: "pubsub" }],
      },
      {
        label: "Route",
        role: "Deliver CloudEvents from 90+ sources (GCS, Firestore, Audit Logs) to handlers.",
        nodes: [{ id: "eventarc" }],
      },
      {
        label: "Compute",
        role: "Serverless handlers that scale to zero and bill per use.",
        nodes: [{ id: "cloud-run" }, { id: "cloud-functions" }],
      },
      {
        label: "State",
        role: "Serverless document store for per-service state.",
        nodes: [{ id: "firestore" }],
      },
    ],
    useCases: [
      "\"When a file lands in a bucket, process it\" (GCS finalize → function).",
      "Order processing where each step is an independent, retriable service.",
      "Spiky workloads that should cost nothing when idle.",
    ],
    examTriggers: [
      "\"trigger on a GCS upload / Firestore write\" → Eventarc / Cloud Functions",
      "\"asynchronous\" / \"decoupled\" / \"fan-out\" → Pub/Sub",
      "\"pay only when running\" / \"scale to zero\" → Cloud Run / Cloud Functions",
    ],
    pitfalls: [
      "For work that must survive retries and backpressure, use Pub/Sub — not synchronous service-to-service calls.",
      "Don't keep an always-on GKE cluster for spiky event workloads — Cloud Run/Functions scale to zero.",
    ],
    variants: [
      {
        when: "Handlers need >60 min runtime or GPUs",
        swap: "Swap Cloud Functions → Cloud Run jobs or GKE",
      },
    ],
  },
  {
    id: "enterprise-landing-zone",
    name: "Hybrid enterprise landing zone",
    tagline: "Org hierarchy + Shared VPC + Interconnect/VPN with central governance",
    category: "networking",
    icon: "shared-vpc",
    problem:
      "Onboard many teams under one governed organization: connect on-prem privately, centralize networking so app teams consume subnets without owning them, and enforce guardrails that hold regardless of a team's IAM.",
    stages: [
      {
        label: "Govern",
        role: "Resource hierarchy plus org-wide guardrails that even project owners can't bypass.",
        nodes: [
          { id: "resource-manager" },
          { id: "org-policy" },
          { id: "cloud-identity" },
        ],
      },
      {
        label: "Connect",
        role: "Private, high-bandwidth link to on-prem with an encrypted VPN backup and dynamic routing.",
        nodes: [
          { id: "cloud-interconnect" },
          { id: "cloud-vpn", label: "HA VPN (backup)" },
          { id: "cloud-router" },
        ],
      },
      {
        label: "Centralize network",
        role: "One host project shares subnets/firewall/connectivity with many service projects.",
        nodes: [{ id: "shared-vpc" }],
      },
      {
        label: "Reach Google APIs privately",
        role: "Access managed services without traversing the public internet.",
        nodes: [
          { id: "private-google-access" },
          { id: "private-service-connect" },
        ],
      },
    ],
    useCases: [
      "Enterprise onboarding many teams under a single governed org.",
      "On-prem datacenter needing private, high-bandwidth access to Google Cloud.",
      "Separate billing/quota per team but one centrally-managed network.",
    ],
    examTriggers: [
      "\"central network team\" / \"many projects, one network\" → Shared VPC",
      "\"private, high & consistent bandwidth, low latency\" → Dedicated Interconnect (VPN as encrypted backup)",
      "\"enforce X regardless of IAM\" / \"guardrails\" → Organization Policy",
      "\"required for an Organization\" / \"sync Active Directory\" → Cloud Identity + GCDS",
    ],
    pitfalls: [
      "VPC Peering is non-transitive and doesn't reach on-prem — it's not a substitute for Interconnect/VPN.",
      "Direct/Carrier Peering does NOT give private RFC1918 access to your VPC — only Google public APIs.",
      "HA VPN only hits 99.99% with two tunnels to two peer devices.",
    ],
    caseStudies: ["ehr", "knightmotives"],
  },
  {
    id: "cloud-migration",
    name: "Migration to Google Cloud",
    tagline: "Interconnect + Migrate-to-VMs + DMS + Storage Transfer / Appliance",
    category: "migration",
    icon: "migration-path",
    problem:
      "Move existing workloads and data off on-prem or another cloud with minimal downtime, picking the right tool per asset type (VMs, databases, bulk objects).",
    stages: [
      {
        label: "Link",
        role: "Private/encrypted path for the migration traffic.",
        nodes: [{ id: "cloud-interconnect" }, { id: "cloud-vpn" }],
      },
      {
        label: "Rehost VMs",
        role: "Lift-and-shift servers, modernize later.",
        nodes: [{ id: "migrate-to-vms" }],
      },
      {
        label: "Migrate databases",
        role: "Continuous replication with near-zero cutover.",
        nodes: [{ id: "dms" }, { id: "cloud-sql" }],
      },
      {
        label: "Move bulk data",
        role: "Online when the network can keep up; offline appliance for PB-scale.",
        nodes: [
          { id: "storage-transfer" },
          { id: "transfer-appliance" },
          { id: "cloud-storage" },
        ],
      },
    ],
    useCases: [
      "Datacenter exit — rehost VMs first, refactor to managed services afterward.",
      "Migrate MySQL/PostgreSQL to Cloud SQL with continuous replication and minimal downtime.",
      "One-time bulk load of large datasets into Cloud Storage.",
    ],
    examTriggers: [
      "\"minimal downtime DB migration\" / \"continuous replication\" → Database Migration Service",
      "\"petabytes\" / \"weeks-to-months over the network\" → Transfer Appliance (offline)",
      "\"rehost\" / \"lift-and-shift VMs\" → Migrate to Virtual Machines",
      "\"ongoing/scheduled online copy to Cloud Storage\" → Storage Transfer Service",
    ],
    pitfalls: [
      "Transfer Appliance only when the network can't move the data in time — otherwise Storage Transfer Service (online).",
      "DMS (not a manual dump/restore) is the answer for near-zero-downtime managed DB migration.",
    ],
    variants: [
      {
        when: "The source is another cloud (S3/Azure)",
        swap: "Storage Transfer Service reads S3/Azure directly; use Cross-Cloud Interconnect for private links",
      },
    ],
    caseStudies: ["ehr"],
  },
  {
    id: "ml-pipeline",
    name: "End-to-end ML pipeline",
    tagline: "BigQuery/GCS → Vertex AI training → endpoints (or pre-trained AI APIs)",
    category: "ml",
    icon: "vertex-ai",
    problem:
      "Go from raw data to a trained, deployed, monitored model with reproducible pipelines — or skip training entirely when a pre-trained API already solves the task.",
    stages: [
      {
        label: "Data",
        role: "Training data in the warehouse or object storage.",
        nodes: [{ id: "bigquery" }, { id: "cloud-storage" }],
      },
      {
        label: "Train",
        role: "Managed pipelines, training, and feature store.",
        nodes: [{ id: "vertex-ai", label: "Vertex AI (Pipelines/Training)" }],
      },
      {
        label: "Serve",
        role: "Online endpoints or batch prediction.",
        nodes: [{ id: "vertex-ai", label: "Vertex AI Endpoints" }],
      },
      {
        label: "Or: no custom model",
        role: "Ready-made models for common tasks — no training needed.",
        nodes: [{ id: "ai-apis", label: "Pre-trained AI APIs" }],
      },
    ],
    useCases: [
      "Demand forecasting or churn prediction from warehouse data.",
      "Deciding between a pre-trained API and a custom-trained model.",
      "Reproducible, governed retraining pipelines.",
    ],
    examTriggers: [
      "\"common task — OCR, speech-to-text, translation, sentiment\" → pre-trained AI APIs",
      "\"custom model\" / \"managed training & serving\" / \"MLOps\" → Vertex AI",
      "\"train on data already in BigQuery with SQL\" → BigQuery ML",
    ],
    pitfalls: [
      "Don't build and train a custom model when a pre-trained API already solves it — it wastes time and cost.",
      "For SQL-first teams, BigQuery ML trains in-place without moving data to Vertex AI.",
    ],
    variants: [
      {
        when: "Analysts want to train models in SQL where the data lives",
        swap: "Swap Vertex AI training → BigQuery ML",
      },
    ],
  },
  {
    id: "multiregion-dr",
    name: "Multi-region HA & disaster recovery",
    tagline: "Regional compute + multi-region data + global LB failover to meet RTO/RPO",
    category: "reliability",
    icon: "dr-strategy",
    problem:
      "Survive a zonal or regional failure and meet defined RTO/RPO targets cost-effectively, choosing a DR tier (backup-restore vs warm standby vs hot active-active) to match the requirement.",
    stages: [
      {
        label: "Compute",
        role: "Spread across zones/regions so no single failure takes the tier down.",
        nodes: [
          { id: "gce", label: "Regional MIG (multi-zone)" },
          { id: "gke" },
        ],
      },
      {
        label: "Data",
        role: "Multi-region or cross-region replicated stores sized to the RPO.",
        nodes: [
          { id: "spanner", label: "Spanner (multi-region)" },
          { id: "cloud-sql", label: "Cloud SQL cross-region replica" },
          { id: "cloud-storage", label: "Multi-region GCS" },
        ],
      },
      {
        label: "Traffic",
        role: "Health-checked global load balancing fails traffic over automatically.",
        nodes: [{ id: "cloud-lb", label: "Global LB + health checks" }],
      },
      {
        label: "Backup",
        role: "Scheduled backups/snapshots retained for restore.",
        nodes: [{ id: "cloud-storage" }],
      },
    ],
    useCases: [
      "Tiered DR chosen by RTO/RPO — backup & restore, warm standby, or hot active-active.",
      "A regulated system that must keep running through a regional outage.",
      "Global users needing both low latency and regional fault tolerance.",
    ],
    examTriggers: [
      "\"RTO / RPO\" / \"survive a region outage\" / \"active-active\" → multi-region Spanner + global LB",
      "\"cheapest DR / can tolerate hours\" → backup & restore to Cloud Storage",
      "\"near-zero RPO\" → synchronous multi-region data (Spanner) / cross-region replicas",
    ],
    pitfalls: [
      "Zonal resources are NOT highly available — a single zone outage takes them down.",
      "Match the DR tier to the RTO/RPO: active-active is costly; don't over-engineer when backup-restore meets the target.",
    ],
    caseStudies: ["ehr", "altostrat"],
  },
];

/** Lookup by id, mirroring SERVICE_INDEX ergonomics. */
export const ARCH_INDEX: Record<string, ArchPattern> = Object.fromEntries(
  ARCHITECTURES.map((a) => [a.id, a]),
);
