// GCP Professional Cloud Architect — Mind Map curriculum data.
// This is the single source of truth for the tree. Pillars -> Services -> Detail.

export type Confidence = "weak" | "reviewing" | "mastered";

export interface ServiceDetail {
  /** Design & Architecture — the "why choose this over alternatives". */
  design: string[];
  /** Security & Compliance — IAM roles, encryption, isolation. */
  security: string[];
  /** Operations & Reliability — HA, failover, monitoring. */
  operations: string[];
  /** Exam keywords — trigger phrases to look for in questions. */
  keywords: string[];
  /** Anti-patterns — explicit conditions where this is the WRONG choice. */
  antipatterns: string[];
  // Case-study tags are derived from lib/caseStudies.ts (single source of truth).
}

/** A single comparison/decision column header. */
export interface MatrixColumn {
  key: string;
  label: string;
}

/** One option (row) being compared in a decision matrix. */
export interface MatrixRow {
  /** The choice, e.g. "HA VPN". */
  option: string;
  /** Attribute values keyed by MatrixColumn.key. */
  cells: Record<string, string>;
  /** Plain-language "choose this when…" summary. */
  pickWhen: string;
}

/**
 * A cross-cutting decision guide: "given constraints, which option?".
 * Rendered as a comparison table instead of the standard 6-section detail.
 */
export interface DecisionMatrix {
  /** The decision being made. */
  question: string;
  columns: MatrixColumn[];
  rows: MatrixRow[];
  /** Common exam traps / gotchas. */
  traps: string[];
  /** Trigger phrase → answer hints. */
  keywords: string[];
}

export interface Service {
  id: string;
  name: string;
  /** Key into the icon map (see lib/icons.ts). */
  icon: string;
  tagline: string;
  /** IDs of frequently paired services (dependency edges / highlighting). */
  pairings?: string[];
  /** Full deep-dive content for a service node. */
  detail?: ServiceDetail;
  /** Present on decision-guide nodes instead of `detail`. */
  matrix?: DecisionMatrix;
  /** A node with neither detail nor matrix is a structural placeholder. */
}

export interface Pillar {
  id: string;
  name: string;
  icon: string;
  /** Tailwind accent color token, e.g. "sky", "emerald". */
  accent: string;
  services: Service[];
}

export const CURRICULUM: Pillar[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. COMPUTE
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "compute",
    name: "Compute",
    icon: "compute",
    accent: "sky",
    services: [
      {
        id: "gce",
        name: "Compute Engine",
        icon: "gce",
        tagline: "IaaS virtual machines",
        pairings: ["cloud-sql", "cloud-iap", "cloud-lb"],
        detail: {
          design: [
            "IaaS VMs — maximum control over OS, kernel, networking & disks. The fallback when a workload needs a specific kernel, licensed software, GPUs/TPUs, or a lift-and-shift of a legacy app.",
            "Machine families: general-purpose (E2/N2/N4), compute-optimized (C2/C3), memory-optimized (M-series), accelerator (A/G). Right-size using recommendations.",
            "Prefer Managed Instance Groups (MIG) + instance template over standalone VMs — they add autoscaling, autohealing, rolling updates & regional (multi-zone) spread.",
            "Sole-tenant nodes for compliance / BYOL license isolation; Spot (Preemptible) VMs for fault-tolerant batch at ~60–91% discount.",
          ],
          security: [
            "OS Login manages SSH via IAM instead of project metadata keys; roles/compute.instanceAdmin, roles/compute.osLogin.",
            "Attach least-privilege service accounts for VM→API auth; Shielded VM (vTPM, secure/measured boot) and Confidential VM (in-use memory encryption).",
            "Disks encrypted at rest by default; CMEK & CSEK supported. Isolate with firewall rules + network tags.",
          ],
          operations: [
            "HA = regional MIG across zones + health checks + autohealing, fronted by Cloud Load Balancing.",
            "Live migration keeps VMs running through host maintenance; incremental snapshots for backup / DR.",
            "Committed Use Discounts (CUD) + Sustained Use Discounts cut cost; rolling MIG updates give zero-downtime deploys.",
          ],
          keywords: [
            "\"full OS / kernel control\"",
            "\"legacy lift-and-shift\"",
            "\"GPUs / licensed software\"",
            "\"MIG autoscaling & autohealing\"",
            "\"Spot / Preemptible for batch\"",
            "\"sole-tenant / BYOL\"",
          ],
          antipatterns: [
            "Stateless HTTP microservices that should scale to zero → Cloud Run, not always-on VMs.",
            "Container orchestration → GKE.",
            "Want zero infra management (PaaS) → App Engine / Cloud Run.",
          ],
        },
      },
      {
        id: "gke",
        name: "Google Kubernetes Engine",
        icon: "gke",
        tagline: "Managed Kubernetes",
        pairings: ["spanner", "memorystore", "cloud-iap"],
        detail: {
          design: [
            "Managed Kubernetes for containerized microservices needing orchestration, portability & fine control. Autopilot (fully managed, pay-per-pod, hardened) vs Standard (you manage nodes).",
            "Choose over Cloud Run when you need the full K8s API: DaemonSets, StatefulSets, service mesh, custom controllers, or complex multi-container pods.",
            "Regional clusters replicate control plane + nodes across zones for HA; cluster autoscaler + Horizontal / Vertical Pod Autoscaling.",
            "Workload Identity is the recommended way for pods to act as GCP service accounts.",
          ],
          security: [
            "Workload Identity (bind KSA → GSA) instead of node service-account keys; Binary Authorization enforces signed/attested images.",
            "Private clusters (no public node IPs) + authorized networks for the control plane; Shielded GKE nodes.",
            "Namespaces + RBAC + Network Policies for tenant isolation; application-layer Secrets encryption via Cloud KMS (CMEK).",
          ],
          operations: [
            "Regional Autopilot control plane = 99.95% SLA; node auto-repair, auto-upgrade & surge upgrades.",
            "Multi-cluster Gateway / Ingress + Multi Cluster Services for multi-region failover.",
            "Native Cloud Monitoring/Logging GKE dashboards; manage rollouts with Deployments.",
          ],
          keywords: [
            "\"Kubernetes / container orchestration\"",
            "\"Autopilot vs Standard\"",
            "\"Workload Identity\"",
            "\"Binary Authorization\"",
            "\"private cluster\"",
            "\"regional cluster HA\"",
          ],
          antipatterns: [
            "Simple stateless request/response container → Cloud Run is simpler and scales to zero.",
            "Team lacks K8s expertise & wants minimal ops → Cloud Run / App Engine.",
            "Single small app → GKE overhead not justified.",
          ],
        },
      },
      {
        id: "cloud-run",
        name: "Cloud Run",
        icon: "cloud-run",
        tagline: "Serverless containers",
        pairings: ["firestore", "cloud-iap", "pubsub"],
        detail: {
          design: [
            "Serverless containers — deploy any container, scales to zero and to thousands automatically, pay-per-use. The default for stateless HTTP / event-driven microservices & APIs.",
            "Choose over GKE for no cluster to manage; over Cloud Run functions when you need a custom container/runtime or more control.",
            "Concurrency > 1 per instance (unlike functions) lowers cost. Cloud Run jobs handle run-to-completion batch tasks.",
            "Reach private backends (Cloud SQL, Memorystore) via Serverless VPC Access / Direct VPC egress.",
          ],
          security: [
            "roles/run.invoker controls who/what can call the service; 'require authentication' + IAP or ID tokens for private services.",
            "Runs as a per-service least-privilege service account; CMEK supported; ingress controls (internal-only / internal+LB).",
            "Front with external HTTPS LB + Cloud Armor for WAF/DDoS.",
          ],
          operations: [
            "Managed multi-zone HA in a region; revisions give instant rollback + gradual traffic splitting (canary / blue-green).",
            "Min instances avoid cold starts; max instances cap cost & DB connections; tune concurrency.",
            "Automatic request logs & metrics in Cloud Monitoring.",
          ],
          keywords: [
            "\"serverless containers / scale to zero\"",
            "\"stateless HTTP / API\"",
            "\"revisions & traffic splitting\"",
            "\"min / max instances\"",
            "\"concurrency\"",
            "\"Cloud Run jobs\"",
          ],
          antipatterns: [
            "Long-lived stateful workloads / full K8s features → GKE.",
            "Heavy always-on compute where it never scales to zero → GCE MIG may be cheaper.",
            "Zero cold-start tolerance with no min-instances budget → reconsider.",
          ],
        },
      },
      {
        id: "cloud-functions",
        name: "Cloud Run Functions",
        icon: "cloud-functions",
        tagline: "Event-driven functions",
        pairings: ["firestore", "pubsub"],
        detail: {
          design: [
            "Event-driven Functions-as-a-Service: run small single-purpose code in response to events (Pub/Sub, Cloud Storage, Firestore, HTTP) with no servers.",
            "2nd gen is built on Cloud Run — concurrency, longer timeouts, bigger instances. Ideal for glue/automation & lightweight event processing.",
            "Choose over Cloud Run when you want the simplest event→function binding without packaging a container.",
          ],
          security: [
            "Per-function service account; roles/cloudfunctions.invoker; secrets from Secret Manager (never inline).",
            "VPC connector for private resource access; CMEK supported.",
          ],
          operations: [
            "Automatic scaling incl. to zero; retries on background functions; set max instances to protect downstream DBs.",
            "Cold starts on scale-from-zero — use min instances for latency-sensitive paths.",
          ],
          keywords: [
            "\"event-driven / FaaS\"",
            "\"trigger on Pub/Sub / GCS / Firestore\"",
            "\"glue code / automation\"",
            "\"scale to zero\"",
            "\"2nd gen on Cloud Run\"",
          ],
          antipatterns: [
            "Complex multi-endpoint services / custom runtimes → Cloud Run.",
            "Long-running or high-CPU sustained work → GCE / GKE.",
            "Multi-step orchestrated workflows → Workflows / Cloud Composer.",
          ],
        },
      },
      {
        id: "app-engine",
        name: "App Engine",
        icon: "app-engine",
        tagline: "Managed PaaS platform",
        detail: {
          design: [
            "Fully managed PaaS for web apps & APIs — deploy code, Google runs the infra & scaling. Standard (sandboxed, scales to zero, fast) vs Flexible (containers on VMs, more control).",
            "Good for classic web apps and teams wanting minimal ops; largely superseded by Cloud Run for new container workloads.",
            "Versioned deployments with traffic splitting for A/B & canary releases.",
          ],
          security: [
            "IAM + App Engine firewall rules; runs as the App Engine (or a user) service account; front with IAP for auth.",
            "Secret Manager + Serverless VPC Access connectors for private resources.",
          ],
          operations: [
            "Automatic scaling (Standard scales to zero); regional service with built-in HA.",
            "Traffic migration/splitting between versions for zero-downtime releases; integrated logging & monitoring.",
          ],
          keywords: [
            "\"PaaS\"",
            "\"Standard vs Flexible\"",
            "\"traffic splitting / versions\"",
            "\"scale to zero (Standard)\"",
            "\"minimal-ops web app\"",
          ],
          antipatterns: [
            "New container-first serverless workloads → Cloud Run (the modern default).",
            "Full Kubernetes control → GKE.",
            "Specific OS/kernel or GPUs → Compute Engine.",
          ],
        },
      },
      {
        id: "persistent-disks",
        name: "Persistent Disks",
        icon: "persistent-disks",
        tagline: "Network block storage for VMs",
        pairings: ["gce", "gke", "dr-strategy"],
        detail: {
          design: [
            "Durable, network-attached block storage independent of the VM lifecycle — data survives instance stop/delete. Types: pd-standard (HDD), pd-balanced, pd-ssd, and pd-extreme for the highest IOPS.",
            "Zonal PD lives in one zone; Regional PD synchronously replicates across two zones in a region for HA/DR. Resize up online (never down); performance scales with size and vCPU count.",
            "Local SSD is physically attached, far faster, but ephemeral — data is lost on stop/terminate; use only for scratch/cache, never durable data.",
            "Snapshots are incremental and global — restore into any zone/region and share across projects to clone or migrate.",
          ],
          security: [
            "Encrypted at rest by default; supports CMEK (Cloud KMS) and CSEK (customer-supplied) keys.",
            "HDD-backed disks use AES-128, SSD-backed use AES-256.",
            "Share snapshots to another project by creating the snapshot directly from the destination project.",
          ],
          operations: [
            "Regional PD is the building block for cross-zone failover of stateful VMs and stateful MIGs.",
            "Scheduled snapshots automate backups; snapshots convert to images for VM templates.",
            "Common snapshot uses: change disk type, migrate zones, reduce disk size, seed new environments.",
          ],
          keywords: [
            "durable block storage",
            "regional PD for cross-zone HA",
            "incremental snapshots",
            "resize up only",
            "local SSD is ephemeral",
            "CMEK / CSEK on disks",
          ],
          antipatterns: [
            "Shared POSIX file system across many VMs → Filestore, not a single PD.",
            "Durable data on Local SSD — it is wiped on stop/terminate.",
            "Object/blob storage or static assets → Cloud Storage.",
          ],
        },
      },
      {
        id: "spot-vms",
        name: "Spot (Preemptible) VMs",
        icon: "spot-vms",
        tagline: "Deep-discount interruptible compute",
        pairings: ["gce", "gke", "cost-optimization"],
        detail: {
          design: [
            "Spare Compute Engine capacity at ~60–91% off on-demand — the go-to cost lever for fault-tolerant, stateless, batch workloads.",
            "Can be reclaimed by Google at any time with a 30-second preemption notice; Spot has no fixed runtime cap (legacy Preemptible VMs were capped at 24h).",
            "Best for batch/render/CI, data processing, and stateless workers behind a queue; combine with MIGs and Dataflow/Dataproc for resilience.",
          ],
          security: [
            "Same IAM, service-account and encryption model as standard Compute Engine VMs.",
            "No security trade-off vs on-demand — the only difference is availability, not isolation.",
          ],
          operations: [
            "Design for interruption: checkpoint work, drain via the shutdown script on the preemption signal, and re-queue tasks.",
            "In GKE, use Spot node pools with taints/tolerations for interruption-tolerant Pods; mix with on-demand for baseline capacity.",
            "Not covered by an SLA — never run the only replica of a service on Spot.",
          ],
          keywords: [
            "cheapest / cost-effective batch",
            "fault-tolerant workloads",
            "30-second preemption notice",
            "no SLA",
            "Spot node pool in GKE",
          ],
          antipatterns: [
            "Stateful or latency-sensitive production services that cannot tolerate sudden termination.",
            "Databases or any single-replica critical workload.",
            "Long-running jobs with no checkpointing.",
          ],
        },
      },
      {
        id: "sole-tenant",
        name: "Sole-tenant Nodes",
        icon: "sole-tenant",
        tagline: "Dedicated physical hosts for VMs",
        pairings: ["gce", "compliance-mapping"],
        detail: {
          design: [
            "Dedicated physical Compute Engine servers that run only your project's VMs — no other tenants share the host.",
            "The answer to physical isolation, compliance/regulatory placement, and Bring-Your-Own-License (per-core/per-socket) requirements.",
            "Use node affinity / anti-affinity labels to pin or spread specific VMs onto specific node groups.",
          ],
          security: [
            "Hardware-level tenant isolation for workloads that must not share physical hosts.",
            "Standard CMEK/Shielded/Confidential VM options still apply on top.",
          ],
          operations: [
            "You manage node maintenance policy (restart in place vs live migrate) during host maintenance.",
            "Priced per node (whole server) regardless of VM packing — right-size to keep utilization high.",
          ],
          keywords: [
            "physical isolation",
            "BYOL (bring your own license)",
            "compliance / dedicated hardware",
            "node affinity labels",
            "single-tenant host",
          ],
          antipatterns: [
            "General workloads with no isolation/licensing requirement — you pay for a whole server.",
            "Bursty, spiky demand better served by shared multi-tenant VMs.",
          ],
        },
      },
      {
        id: "anthos",
        name: "Anthos",
        icon: "anthos",
        tagline: "Managed hybrid & multi-cloud platform",
        pairings: ["gke", "cloud-monitoring", "vpc-sc"],
        detail: {
          design: [
            "A managed platform for running and governing GKE consistently across Google Cloud, on-premises (GKE on VMware/bare metal) and other clouds — one control plane, one policy model.",
            "The classic fit when a case study needs consistent Kubernetes management across multiple, potentially different environments.",
            "Fleets group clusters; Config Management (GitOps) enforces config and policy centrally; Anthos Service Mesh adds mTLS, traffic management and observability.",
          ],
          security: [
            "Policy Controller enforces guardrails (OPA/Gatekeeper) across the fleet; ASM enforces mTLS between services.",
            "Central IAM + Config Management keep clusters consistent and auditable everywhere.",
          ],
          operations: [
            "Config Controller / Config Management provide consistent, single-pane management and drift correction via Git.",
            "ASM enables fault injection, circuit breaking and request timeouts for resiliency testing.",
          ],
          keywords: [
            "hybrid / multi-cloud Kubernetes",
            "consistent management across environments",
            "fleets + Config Management (GitOps)",
            "Anthos Service Mesh (mTLS)",
            "single control plane",
          ],
          antipatterns: [
            "A single GKE cluster wholly inside Google Cloud — plain GKE is enough.",
            "Simple stateless containers with no governance/hybrid need → Cloud Run.",
          ],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. STORAGE & DATABASES (fully seeded)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "storage-databases",
    name: "Storage & Databases",
    icon: "storage",
    accent: "emerald",
    services: [
      {
        id: "cloud-sql",
        name: "Cloud SQL",
        icon: "cloud-sql",
        tagline: "Managed OLTP relational (MySQL / PostgreSQL / SQL Server)",
        pairings: ["dms", "memorystore", "gce"],
        detail: {
          design: [
            "Fully managed relational DB for MySQL, PostgreSQL & SQL Server — the default for lift-and-shift OLTP workloads.",
            "Choose over Spanner when you need a single-region relational DB and do NOT require horizontal write scaling or global strong consistency.",
            "Scales vertically only (bigger machine). Read replicas — including cross-region — offload read traffic.",
            "Max 64 TB storage per instance. Use Database Migration Service (DMS) for near-zero-downtime homogeneous & heterogeneous migrations.",
          ],
          security: [
            "IAM database authentication + Cloud SQL Auth Proxy for secure connections without IP allowlisting.",
            "Encryption at rest by default; supports CMEK (customer-managed keys via Cloud KMS).",
            "Private IP via VPC / Private Service Connect keeps traffic off the public internet; SSL/TLS can be enforced.",
            "Key roles: roles/cloudsql.client, roles/cloudsql.editor, roles/cloudsql.admin.",
          ],
          operations: [
            "Regional HA = synchronous standby in a second zone with automatic failover (99.95% SLA).",
            "Automated backups + point-in-time recovery (PITR) via binary/WAL logs.",
            "Cross-region read replicas can be manually promoted for disaster recovery.",
          ],
          keywords: [
            "\"Managed MySQL/PostgreSQL\"",
            "\"lift and shift\" relational",
            "\"regional HA / failover replica\"",
            "\"read replica\"",
            "64 TB limit",
            "DMS migration",
          ],
          antipatterns: [
            "Global, horizontally write-scaled relational → use Spanner, NOT Cloud SQL.",
            "Beyond 64 TB or petabyte analytics → BigQuery / Bigtable.",
            "High-throughput NoSQL / time-series → Bigtable or Firestore.",
          ],
        },
      },
      {
        id: "spanner",
        name: "Cloud Spanner",
        icon: "spanner",
        tagline: "Globally-distributed, horizontally-scaling relational (ACID)",
        pairings: ["gke", "bigquery", "memorystore"],
        detail: {
          design: [
            "Fully managed relational DB combining ACID transactions + SQL with horizontal scale across regions/continents.",
            "Choose when you need global strong consistency AND a relational schema AND unlimited write scale — the one thing Cloud SQL cannot do.",
            "Capacity is provisioned in nodes / processing units; scales to petabytes with strong consistency backed by TrueTime.",
            "Schema design is critical: use non-sequential / hashed / UUID primary keys to prevent hotspotting on monotonically increasing keys.",
          ],
          security: [
            "IAM roles: roles/spanner.databaseUser, roles/spanner.databaseAdmin; supports CMEK.",
            "Fine-grained access control (row/column level); data-layer encryption by default.",
            "Protect against exfiltration with a VPC Service Controls perimeter.",
          ],
          operations: [
            "Up to 99.999% availability SLA in a multi-region config (99.99% for regional).",
            "Automatic synchronous replication; multi-region enables global reads/writes with transparent failover.",
            "Keep high-priority CPU < 65% (regional) / 45% (multi-region) to preserve failover headroom.",
          ],
          keywords: [
            "\"ACID + Global = Spanner\"",
            "\"horizontal write scaling\" relational",
            "99.999% availability",
            "TrueTime",
            "\"avoid hotspotting\" / non-sequential keys",
          ],
          antipatterns: [
            "Single-region, cost-sensitive relational → Cloud SQL (Spanner costs more).",
            "Analytics / data warehouse → BigQuery.",
            "Sequential / auto-increment primary keys → creates write hotspots (classic Spanner anti-pattern).",
          ],
        },
      },
      {
        id: "bigtable",
        name: "Cloud Bigtable",
        icon: "bigtable",
        tagline: "Petabyte-scale wide-column NoSQL, sub-10 ms latency",
        pairings: ["dataflow", "bigquery", "pubsub"],
        detail: {
          design: [
            "Wide-column NoSQL for massive throughput & low latency: IoT, time-series, AdTech, financial ticks, monitoring metrics.",
            "Scales linearly by adding nodes; HBase-compatible API. Choose for high-throughput operational reads/writes.",
            "ONLY a single row-key index — row-key design determines performance. Put the most-queried, high-cardinality field into the key prefix.",
            "Bigtable vs BigQuery: Bigtable for operational high-QPS access, BigQuery for analytical SQL scans.",
          ],
          security: [
            "IAM roles: roles/bigtable.user, roles/bigtable.admin; CMEK supported.",
            "Encryption at rest by default; VPC Service Controls; private access via Private Service Connect.",
          ],
          operations: [
            "Sub-10 ms latency at scale. Replication provides HA & multi-region reads (eventual consistency across clusters).",
            "App profiles control single-cluster vs multi-cluster routing.",
            "Monitor CPU & disk utilization; add nodes to scale throughput linearly.",
          ],
          keywords: [
            "\"time-series / IoT\"",
            "\"sub-10ms\" latency",
            "\"wide-column NoSQL\"",
            "\"single row-key index\"",
            "high throughput",
            "HBase API",
          ],
          antipatterns: [
            "Need SQL joins or ad-hoc analytics → BigQuery.",
            "Transactional relational / multi-row ACID → Spanner or Cloud SQL.",
            "Small datasets (< 1 TB) or low QPS → cost-inefficient; use Firestore / Cloud SQL.",
          ],
        },
      },
      {
        id: "bigquery",
        name: "BigQuery",
        icon: "bigquery",
        tagline: "Serverless petabyte-scale OLAP data warehouse",
        pairings: ["dataflow", "pubsub", "bigtable", "looker"],
        detail: {
          design: [
            "Serverless, fully managed enterprise data warehouse for OLAP analytics over petabytes using standard SQL.",
            "Separation of storage & compute — no infrastructure to manage. Built for analytics, BI & ML (BigQuery ML), NOT transactional OLTP.",
            "Optimize cost & speed with partitioned tables (by date/ingestion time) and clustered tables; avoid SELECT *.",
            "Supports streaming inserts + batch loads; BI Engine for sub-second dashboards; BigQuery Omni for multi-cloud analytics.",
          ],
          security: [
            "IAM roles: roles/bigquery.dataViewer, dataEditor, jobUser; column-level & row-level security via policy tags.",
            "CMEK supported; authorized views/datasets share results without exposing source tables.",
            "Encryption at rest by default; VPC Service Controls to prevent data exfiltration.",
          ],
          operations: [
            "99.99% availability; automatic replication within the multi-region location.",
            "Slot management: on-demand (per-TB scanned) vs capacity/Editions (reserved slots) pricing.",
            "Monitor bytes scanned & slot utilization; use reservations for predictable cost.",
          ],
          keywords: [
            "\"serverless data warehouse\"",
            "\"petabyte analytics\"",
            "\"partition + cluster\"",
            "\"slots / reservations\"",
            "OLAP not OLTP",
            "BigQuery ML",
          ],
          antipatterns: [
            "Low-latency single-row lookups / OLTP → Bigtable, Cloud SQL or Spanner.",
            "Frequent small row-level updates/deletes → append-oriented, not ideal.",
            "Sub-second high-QPS serving → use Bigtable or a serving database.",
          ],
        },
      },
      {
        id: "firestore",
        name: "Firestore",
        icon: "firestore",
        tagline: "Serverless document NoSQL with realtime sync & offline",
        pairings: ["cloud-run", "cloud-functions"],
        detail: {
          design: [
            "Serverless document database (Native mode) for mobile/web backends with realtime listeners & offline sync.",
            "Strong consistency + automatic multi-region scaling; successor to Datastore (use Datastore mode for server-side workloads).",
            "Choose for flexible-document app backends needing realtime — not heavy analytics or wide-column throughput.",
          ],
          security: [
            "Firestore Security Rules govern client access; IAM governs server access; CMEK supported.",
            "Encryption at rest by default; VPC Service Controls.",
          ],
          operations: [
            "Multi-region locations deliver up to 99.999% availability; automatic scaling with no capacity planning.",
            "Composite indexes required for complex queries; monitor via Cloud Monitoring.",
          ],
          keywords: [
            "\"document NoSQL\"",
            "\"realtime / offline sync\"",
            "\"mobile/web backend\"",
            "\"Datastore successor\"",
            "serverless scaling",
          ],
          antipatterns: [
            "Complex analytical SQL → BigQuery.",
            "High-throughput time-series → Bigtable.",
            "Relational joins / strict relational schema → Cloud SQL / Spanner.",
          ],
        },
      },
      {
        id: "cloud-storage",
        name: "Cloud Storage",
        icon: "cloud-storage",
        tagline: "Unified object storage with lifecycle tiers",
        pairings: ["dataflow", "bigquery", "cloud-cdn"],
        detail: {
          design: [
            "Object storage for unstructured data: blobs, images, backups, data-lake landing zone, static web assets.",
            "Storage classes Standard → Nearline (30d) → Coldline (90d) → Archive (365d); pick by access frequency, automate with lifecycle rules.",
            "Location types regional / dual-region / multi-region trade off latency, cost & availability.",
          ],
          security: [
            "IAM (prefer uniform bucket-level access) + optional ACLs; CMEK & CSEK (customer-supplied keys) supported.",
            "Signed URLs grant temporary scoped access; VPC Service Controls guard against exfiltration.",
            "Object Versioning + Retention Policies + Bucket Lock provide WORM / compliance immutability.",
          ],
          operations: [
            "Multi-region availability SLA up to 99.95%; eleven 9's durability.",
            "Turbo replication tightens dual-region RPO; lifecycle management automates tiering & deletion.",
          ],
          keywords: [
            "\"object storage\"",
            "\"Nearline / Coldline / Archive\"",
            "\"lifecycle policy\"",
            "\"signed URL\"",
            "\"Bucket Lock / retention (WORM)\"",
            "CSEK vs CMEK",
          ],
          antipatterns: [
            "Low-latency structured queries → a database, not GCS.",
            "POSIX / shared file-system semantics → Filestore, not GCS.",
          ],
        },
      },
      {
        id: "memorystore",
        name: "Memorystore",
        icon: "memorystore",
        tagline: "Managed Redis / Memcached in-memory cache",
        pairings: ["gke", "cloud-sql"],
        detail: {
          design: [
            "Fully managed in-memory datastore (Redis & Memcached) for caching, session state, leaderboards & sub-ms lookups.",
            "Use to offload read pressure from Cloud SQL / Spanner (cache-aside) or accelerate hot paths.",
          ],
          security: [
            "IAM; in-transit encryption + AUTH (Redis); private IP only (VPC).",
          ],
          operations: [
            "Redis Standard tier = cross-zone replication with automatic failover for HA.",
            "Monitor memory usage & evictions; scale by tier / instance size.",
          ],
          keywords: [
            "\"in-memory cache\"",
            "\"Redis / Memcached\"",
            "\"session store\"",
            "\"sub-ms latency\"",
            "cache-aside",
          ],
          antipatterns: [
            "Durable system of record → it's a cache, not primary storage.",
            "Analytical queries → BigQuery.",
          ],
        },
      },
      {
        id: "filestore",
        name: "Filestore",
        icon: "filestore",
        tagline: "Managed NFS file storage",
        pairings: ["gce", "gke", "cloud-storage"],
        detail: {
          design: [
            "Fully-managed NFSv3 file server — shared POSIX file system mountable by many Compute Engine VMs and GKE Pods at once.",
            "The answer when an application needs a shared file system / concurrent file access (lift-and-shift NFS, content repos, media rendering, HPC scratch, home directories).",
            "Tiers: Basic (HDD/SSD), Zonal, Enterprise (regional, higher availability), and High Scale for large throughput — pick on capacity, IOPS/throughput and availability.",
          ],
          security: [
            "Access controlled at the network layer (authorized VPC + IP ranges) plus standard NFS/POSIX permissions.",
            "Encrypted at rest by default; CMEK supported on Enterprise tier.",
          ],
          operations: [
            "Enterprise tier offers regional (multi-zone) availability and snapshots/backups for the file share.",
            "Scale capacity/performance by resizing the instance; throughput scales with provisioned capacity.",
          ],
          keywords: [
            "shared / concurrent file system",
            "managed NFS",
            "POSIX file access from many VMs",
            "lift-and-shift NAS",
            "GKE ReadWriteMany volumes",
          ],
          antipatterns: [
            "Object/blob storage or web assets → Cloud Storage (cheaper, HTTP-native).",
            "A single VM's boot/data disk → Persistent Disk.",
            "Structured/relational data → Cloud SQL / Spanner.",
          ],
        },
      },
      {
        id: "datastore",
        name: "Datastore",
        icon: "datastore",
        tagline: "Legacy document DB (now Firestore)",
        pairings: ["firestore", "app-engine"],
        detail: {
          design: [
            "Highly-scalable NoSQL document database — now superseded by Firestore, which runs in \"Datastore mode\" for backwards compatibility.",
            "For any new design choose Firestore; Datastore mode is for existing App Engine / Datastore apps that need the classic API and strong consistency at scale without the real-time/mobile features.",
            "Great backend for App Engine apps and for storing entity data like user profiles or game state.",
          ],
          security: [
            "IAM controls at the database level; encrypted at rest by default.",
            "Datastore mode gives strong consistency for all queries (unlike the old eventual-consistency global queries).",
          ],
          operations: [
            "Serverless and fully managed — automatic multi-region replication and scaling, no capacity planning.",
            "A project's Firestore database is either Native mode or Datastore mode — the choice is permanent per database.",
          ],
          keywords: [
            "legacy / existing Datastore app",
            "Firestore in Datastore mode",
            "App Engine backend",
            "server-side NoSQL at scale",
          ],
          antipatterns: [
            "New apps, or mobile/web with real-time sync/offline → Firestore Native mode.",
            "Analytics / SQL over huge datasets → BigQuery.",
            "High-throughput wide-column time-series → Bigtable.",
          ],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. NETWORKING
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "networking",
    name: "Networking",
    icon: "networking",
    accent: "violet",
    services: [
      {
        id: "vpc",
        name: "Virtual Private Cloud",
        icon: "vpc",
        tagline: "Global software-defined network",
        detail: {
          design: [
            "Global, software-defined virtual network; subnets are regional (span zones). One VPC can span all regions without VPNs.",
            "Shared VPC lets a host project share subnets with service projects (central network admin); VPC Peering connects VPCs privately but is NON-transitive.",
            "Private Google Access lets VMs without external IPs reach Google APIs; Private Service Connect for private access to services/APIs.",
            "Routes & firewall rules are global; apply hierarchical firewall policies at org/folder level.",
          ],
          security: [
            "Firewall rules (allow/deny, priority, tags, service accounts) + hierarchical firewall policies; default-deny ingress.",
            "VPC Service Controls perimeters guard managed services against exfiltration; Private Google Access keeps traffic off the public internet.",
            "VPC Flow Logs & Firewall Rules Logging for audit & forensics.",
          ],
          operations: [
            "Global resource → resilient; use multiple regions/subnets for HA; Network Intelligence Center for topology & connectivity tests.",
            "Cloud Router (BGP) exchanges dynamic routes with hybrid connectivity.",
          ],
          keywords: [
            "\"global VPC / regional subnets\"",
            "\"Shared VPC vs VPC Peering\"",
            "\"Private Google Access\"",
            "\"hierarchical firewall policy\"",
            "\"peering is non-transitive\"",
          ],
          antipatterns: [
            "Expecting transitive routing across peered VPCs → not supported; use hub-and-spoke / Network Connectivity Center.",
            "Overlapping CIDR ranges when peering → not allowed.",
          ],
        },
      },
      {
        id: "cloud-lb",
        name: "Cloud Load Balancing",
        icon: "cloud-lb",
        tagline: "Global / regional load balancers",
        pairings: ["gce", "cloud-cdn", "cloud-armor"],
        detail: {
          design: [
            "Fully managed, software-defined load balancing. The global external Application LB (L7) gives a single anycast IP, cross-region failover & Cloud CDN integration.",
            "Types: global external ALB (L7), regional external/internal ALB, external/internal passthrough Network LB (L4). Pick by protocol, scope (global vs regional) & internal vs external.",
            "Global ALB routes to the nearest healthy backend; supports backend buckets (GCS), MIGs, and NEGs (serverless & hybrid/on-prem).",
          ],
          security: [
            "Integrates with Cloud Armor (WAF, geo/IP, DDoS) and Google-managed SSL certs; IAP can gate access.",
            "SSL policies enforce TLS versions/ciphers.",
          ],
          operations: [
            "Built-in health checks + backend autoscaling; global LB gives cross-region failover on ONE IP — no DNS changes.",
            "No pre-warming needed (scales instantly); monitor backend latency & 5xx.",
          ],
          keywords: [
            "\"single global anycast IP\"",
            "\"cross-region failover (no DNS)\"",
            "\"L7 ALB vs L4 Network LB\"",
            "\"internal vs external\"",
            "\"NEG / serverless backend\"",
            "\"Cloud Armor + LB\"",
          ],
          antipatterns: [
            "Hand-rolling DNS-based failover → the global LB anycast IP already fails over.",
            "Wrong LB type for the protocol → use passthrough Network LB for raw TCP/UDP.",
          ],
        },
      },
      {
        id: "cloud-cdn",
        name: "Cloud CDN",
        icon: "cloud-cdn",
        tagline: "Edge content caching",
        pairings: ["cloud-storage", "cloud-lb"],
        detail: {
          design: [
            "Caches content at Google's global edge POPs to cut latency & origin load; enabled on a backend of the global external Application LB.",
            "Origins: GCS buckets, MIGs, or external backends. Cache modes (USE_ORIGIN_HEADERS / CACHE_ALL_STATIC / FORCE_CACHE_ALL) & TTLs.",
            "Great for static assets, media streaming and cacheable API responses.",
          ],
          security: [
            "Signed URLs / signed cookies restrict access to cached content; Cloud Armor at the LB; HTTPS at edge with managed certs.",
          ],
          operations: [
            "Cache invalidation for purges; negative caching for errors; monitor cache hit ratio.",
          ],
          keywords: [
            "\"edge caching / POPs\"",
            "\"requires external Application LB\"",
            "\"signed URLs / cookies\"",
            "\"cache hit ratio\"",
            "\"static & media offload\"",
          ],
          antipatterns: [
            "Highly dynamic, per-user, uncacheable responses → limited benefit.",
            "Internal-only traffic → CDN is for external edge delivery.",
          ],
        },
      },
      {
        id: "cloud-dns",
        name: "Cloud DNS",
        icon: "cloud-dns",
        tagline: "Managed authoritative DNS",
        detail: {
          design: [
            "Managed, highly available authoritative DNS (100% availability SLA) with global anycast. Public zones (internet) & private zones (VPC-internal).",
            "Supports DNS peering, forwarding to on-prem and split-horizon DNS. Routing policies (geo/weighted) for traffic steering & failover.",
          ],
          security: [
            "DNSSEC signing for integrity; roles/dns.admin; private zones keep internal names off the internet.",
          ],
          operations: [
            "100% availability SLA; low-latency anycast resolution across Google's edge.",
          ],
          keywords: [
            "\"authoritative DNS / 100% SLA\"",
            "\"public vs private zones\"",
            "\"DNSSEC\"",
            "\"DNS forwarding / peering to on-prem\"",
            "\"geo / weighted routing policy\"",
          ],
          antipatterns: [
            "Fast LB failover where DNS TTLs are too slow → prefer the Global LB anycast IP over DNS failover.",
          ],
        },
      },
      {
        id: "cloud-interconnect",
        name: "Cloud Interconnect",
        icon: "cloud-interconnect",
        tagline: "Dedicated hybrid connectivity",
        detail: {
          design: [
            "Private, high-bandwidth hybrid connectivity to on-prem. Dedicated Interconnect (physical 10/100 Gbps) vs Partner Interconnect (via provider, 50 Mbps–50 Gbps).",
            "Cloud VPN (HA VPN, 99.99% SLA) gives encrypted tunnels over the internet — lower bandwidth, fast to stand up.",
            "Choose Interconnect for bandwidth/consistency/private RFC1918 access; VPN for encryption / lower cost. Cloud Router (BGP) exchanges routes.",
          ],
          security: [
            "Interconnect traffic stays private (never public internet); add MACsec where available. VPN uses IPsec encryption.",
          ],
          operations: [
            "HA VPN 99.99% SLA; Dedicated Interconnect 99.9% (single) / 99.99% (redundant across metros/zones) — design redundant attachments.",
          ],
          keywords: [
            "\"Dedicated vs Partner Interconnect\"",
            "\"HA VPN 99.99%\"",
            "\"Cloud Router / BGP\"",
            "\"private RFC1918 to on-prem\"",
            "\"bandwidth vs encryption tradeoff\"",
          ],
          antipatterns: [
            "Small / quick encrypted link → HA VPN, not a Dedicated Interconnect (over-provisioning).",
            "Need encryption over the internet → VPN (Interconnect is private but not encrypted by default).",
          ],
        },
      },
      {
        id: "cloud-nat",
        name: "Cloud NAT",
        icon: "cloud-nat",
        tagline: "Managed outbound NAT",
        detail: {
          design: [
            "Managed, distributed NAT giving private instances (no external IP) outbound internet access without exposing them to inbound connections.",
            "Regional; works with the VPC. Static or auto IP allocation with per-VM port allocation.",
          ],
          security: [
            "Instances stay private (no public IP) — shrinks attack surface; pair with firewall egress rules.",
          ],
          operations: [
            "No NAT gateway VM to scale or patch — fully managed & HA; monitor port usage / dropped connections.",
          ],
          keywords: [
            "\"outbound-only for private VMs\"",
            "\"no external IP\"",
            "\"managed & HA (no NAT VM)\"",
            "\"port allocation\"",
          ],
          antipatterns: [
            "Need inbound access → use a Load Balancer, not Cloud NAT.",
            "Reaching Google APIs privately → Private Google Access is cheaper than routing via NAT.",
          ],
        },
      },
      {
        id: "cloud-vpn",
        name: "Cloud VPN",
        icon: "cloud-vpn",
        tagline: "Encrypted IPsec tunnels to on-prem",
        pairings: ["cloud-router", "vpc", "hybrid-connectivity"],
        detail: {
          design: [
            "Site-to-site IPsec VPN over the public internet between your VPC and on-prem (or another cloud). HA VPN offers a 99.99% SLA with two interfaces; Classic VPN is single-tunnel (99.9%).",
            "A regional service, max ~3 Gbps per tunnel (aggregate multiple tunnels for more). The quick, encrypted, low-cost hybrid link — stands up in hours.",
            "Often the encrypted backup path behind a primary Dedicated/Partner Interconnect.",
          ],
          security: [
            "Traffic is encrypted with IPsec (supports IKEv1 and IKEv2) using pre-shared keys.",
            "Requires a public IP on the peer gateway; max & recommended MTU is 1460.",
          ],
          operations: [
            "Pair with Cloud Router for dynamic BGP route exchange so new subnets propagate automatically.",
            "For HA, use HA VPN with two tunnels to separate on-prem devices; never rely on a single tunnel for production.",
          ],
          keywords: [
            "encrypted / IPsec to on-prem",
            "HA VPN 99.99% SLA",
            "quick, low-bandwidth hybrid link",
            "backup for Interconnect",
            "regional, ~3 Gbps per tunnel",
          ],
          antipatterns: [
            "High, consistent bandwidth or lowest latency, private link → Dedicated/Partner Interconnect.",
            "Reaching only Google public APIs privately → Private Google Access, not a VPN.",
          ],
        },
      },
      {
        id: "cloud-router",
        name: "Cloud Router",
        icon: "cloud-router",
        tagline: "Dynamic BGP routing for hybrid",
        pairings: ["cloud-vpn", "cloud-interconnect", "cloud-nat"],
        detail: {
          design: [
            "A fully-managed BGP speaker that dynamically exchanges routes between your VPC and on-prem over HA VPN or Cloud Interconnect — no static routes to maintain.",
            "Newly-added subnets on either side are advertised automatically, so hybrid connectivity keeps working as networks grow.",
            "Required to make HA VPN and Interconnect dynamic; also the control plane behind Cloud NAT.",
          ],
          security: [
            "Route advertisement can be scoped (advertise specific subnets/ranges) to limit exposure.",
            "Operates within the VPC/region; combine with firewall rules for traffic control.",
          ],
          operations: [
            "Regional resource — deploy per region where you have hybrid attachments.",
            "Supports custom route advertisements and graceful failover for HA topologies.",
          ],
          keywords: [
            "dynamic BGP routing",
            "auto-advertise new subnets",
            "required for HA VPN / Interconnect",
            "underpins Cloud NAT",
          ],
          antipatterns: [
            "A tiny static topology that never changes may not need dynamic routing.",
            "It is not itself a connection — you still need VPN or Interconnect underneath.",
          ],
        },
      },
      {
        id: "shared-vpc",
        name: "Shared VPC",
        icon: "shared-vpc",
        tagline: "One network shared across projects",
        pairings: ["vpc", "iam", "resource-manager"],
        detail: {
          design: [
            "Lets a host project share its VPC subnets with multiple service projects — the most common way to centralize networking while keeping projects separate for security, billing and quota.",
            "Central network/security team manages the host project (subnets, routes, firewall, VPN/Interconnect); app teams deploy resources into shared subnets from service projects.",
            "Host and all service projects must belong to the same organization.",
          ],
          security: [
            "Strong separation of duties: service-project admins get only the Network User role (compute.networkUser) — they consume subnets but can't change network config.",
            "Firewall rules and hybrid connectivity are governed centrally in the host project.",
          ],
          operations: [
            "Connectivity to other networks (VPN/Interconnect) is managed once in the host project and reused by all service projects.",
            "Scales to many projects without the overhead of managing many separate VPCs.",
          ],
          keywords: [
            "share one network across projects",
            "host project + service projects",
            "central network administration",
            "Network User role",
            "same organization required",
          ],
          antipatterns: [
            "Connecting VPCs across organizations or peers → VPC Peering / Network Connectivity Center.",
            "A single project with one network — no sharing needed.",
          ],
        },
      },
      {
        id: "vpc-peering",
        name: "VPC Peering",
        icon: "vpc-peering",
        tagline: "Private VPC-to-VPC connectivity",
        pairings: ["vpc", "shared-vpc", "vpc-connectivity"],
        detail: {
          design: [
            "Connects two VPCs so they communicate using internal IPs, with high throughput and very low latency (traffic stays on Google's network — no VPN gateway).",
            "Works both within and across organizations; each side chooses which subnet routes to advertise, and IP ranges must not overlap.",
            "Increasingly required by managed products — Apigee X and Datastream both use peering in their setup.",
          ],
          security: [
            "Administrators on BOTH VPCs must configure the peering for it to activate.",
            "Firewall rules still apply independently in each VPC; peering exchanges routes, not policy.",
          ],
          operations: [
            "Non-transitive: if A↔B and B↔C are peered, A cannot reach C through B.",
            "For transitive hub-and-spoke across many VPCs, use Network Connectivity Center instead.",
          ],
          keywords: [
            "private VPC-to-VPC over internal IPs",
            "non-transitive",
            "both sides must configure",
            "non-overlapping CIDRs",
            "required by Apigee X / Datastream",
          ],
          antipatterns: [
            "Transitive routing through a hub across many VPCs → Network Connectivity Center.",
            "Sharing one network within an org → Shared VPC.",
            "Overlapping IP ranges — peering will fail.",
          ],
        },
      },
      {
        id: "private-google-access",
        name: "Private Google Access",
        icon: "private-google-access",
        tagline: "Reach Google APIs without external IPs",
        pairings: ["vpc", "cloud-nat", "private-service-connect"],
        detail: {
          design: [
            "A per-subnet setting that lets VMs with NO external IP reach Google APIs and services (Cloud Storage, BigQuery, etc.) over Google's internal network instead of the public internet.",
            "The standard answer for 'private VMs still need to call Google APIs' — no public IPs and no internet NAT required for Google-bound traffic.",
            "A variant, Private Google Access for on-premises hosts, reaches Google APIs from the datacenter through VPN/Interconnect via the restricted/private VIPs.",
          ],
          security: [
            "Keeps API traffic off the public internet and lets you drop external IPs entirely, shrinking the attack surface.",
            "Pair with VPC Service Controls and the restricted.googleapis.com VIP to block data exfiltration to non-allowed Google resources.",
          ],
          operations: [
            "Enabled per-subnet; the VM needs a route to the Google API ranges but no external IP.",
            "For DNS, map *.googleapis.com to the private/restricted VIP so requests resolve internally.",
          ],
          keywords: [
            "VMs with no external IP calling Google APIs",
            "per-subnet setting",
            "private.googleapis.com / restricted.googleapis.com VIP",
            "on-prem access to Google APIs over VPN/Interconnect",
          ],
          antipatterns: [
            "Reaching third-party/on-prem or published services privately → Private Service Connect, not PGA.",
            "Giving instances public egress to the internet → Cloud NAT (a different need).",
          ],
        },
      },
      {
        id: "private-service-connect",
        name: "Private Service Connect",
        icon: "private-service-connect",
        tagline: "Private endpoints to services & APIs",
        pairings: ["vpc", "private-google-access", "cloud-lb"],
        detail: {
          design: [
            "Creates a private endpoint (an internal IP in your VPC) that connects to Google APIs, your own published services, or a third party's service — traffic never traverses the public internet or requires VPC peering.",
            "Solves 'consume a service in another VPC/org privately, with no overlapping-IP or transitivity headaches' — the gap VPC Peering can't cleanly fill.",
            "Flavors: PSC for Google APIs, PSC endpoints to a producer's published service, and PSC for published services (where you are the producer behind an internal load balancer).",
          ],
          security: [
            "Keeps service traffic on Google's network with a private IP — no external exposure and no broad network merge as with peering.",
            "Access is explicit per endpoint/service, giving a cleaner trust boundary than route-exchanging peering.",
          ],
          operations: [
            "Consumer creates an endpoint; producer publishes a service behind an internal load balancer — decoupled and independently scaled.",
            "Consumer and producer IP ranges don't need to align, avoiding CIDR collisions.",
          ],
          keywords: [
            "private endpoint / internal IP to a service",
            "no VPC peering, no overlapping-IP problems",
            "consumer ↔ producer service model",
            "private access to Google APIs (PSC)",
            "SaaS / cross-org private connectivity",
          ],
          antipatterns: [
            "Full bidirectional connectivity between two VPCs → VPC Peering / Network Connectivity Center.",
            "Just letting no-external-IP VMs call Google APIs on a subnet → Private Google Access is simpler.",
          ],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. SECURITY, IDENTITY & COMPLIANCE
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "security",
    name: "Security, Identity & Compliance",
    icon: "security",
    accent: "rose",
    services: [
      {
        id: "iam",
        name: "Cloud IAM",
        icon: "iam",
        tagline: "Roles, policies & service accounts",
        detail: {
          design: [
            "Controls who (identity) can do what (role) on which resource. A policy binds members → roles, inherited down the hierarchy (Org → Folder → Project → Resource).",
            "Prefer predefined roles over broad basic roles (Owner/Editor/Viewer); build least-privilege with custom roles. Grant to groups, not individual users.",
            "Service accounts for workload identity; avoid key files — use Workload Identity Federation (external IdPs) & Workload Identity (GKE).",
          ],
          security: [
            "IAM Conditions (attribute-based: time/resource); IAM Recommender flags excess permissions; deny policies for guardrails.",
            "Org policies (constraints) enforce org-wide rules; enforce separation of duties.",
          ],
          operations: [
            "Every policy change is captured in Cloud Audit Logs; use Policy Analyzer / Troubleshooter to debug access.",
          ],
          keywords: [
            "\"least privilege / predefined > basic roles\"",
            "\"resource hierarchy inheritance\"",
            "\"groups over users\"",
            "\"Workload Identity Federation (no keys)\"",
            "\"IAM Conditions\"",
            "\"service account impersonation\"",
          ],
          antipatterns: [
            "Granting Owner/Editor broadly → violates least privilege.",
            "Downloading & sharing SA key files → use Workload Identity Federation / short-lived tokens instead.",
          ],
        },
      },
      {
        id: "vpc-sc",
        name: "VPC Service Controls",
        icon: "vpc-sc",
        tagline: "Data exfiltration perimeter",
        pairings: ["bigquery", "cloud-storage"],
        detail: {
          design: [
            "Creates a security perimeter around managed services (BigQuery, GCS, etc.) to prevent data exfiltration — even by identities with valid IAM.",
            "Mitigates stolen credentials & misconfiguration by blocking data movement across the perimeter boundary.",
            "Complements IAM: IAM = who can access; VPC-SC = from where / whether data can leave. Ingress/egress rules + access levels (Access Context Manager) for exceptions.",
          ],
          security: [
            "Perimeters, bridges, and ingress/egress policies; combine with Private Google Access + the restricted VIP.",
            "Context-aware access via device/IP/identity conditions.",
          ],
          operations: [
            "Dry-run mode tests perimeter impact before enforcing; violations captured in audit logs.",
          ],
          keywords: [
            "\"data exfiltration prevention\"",
            "\"service perimeter\"",
            "\"IAM = who / VPC-SC = from where\"",
            "\"dry-run mode\"",
            "\"restricted VIP / Private Google Access\"",
            "\"stolen credential mitigation\"",
          ],
          antipatterns: [
            "Using it as an authentication mechanism → it's an exfiltration boundary; pair with IAM.",
            "Expecting it to protect unsupported services → check the supported-product list.",
          ],
        },
      },
      {
        id: "cloud-kms",
        name: "Cloud KMS",
        icon: "cloud-kms",
        tagline: "Managed encryption keys (CMEK)",
        detail: {
          design: [
            "Managed cryptographic key service. Enables CMEK across GCS, BigQuery, Cloud SQL, etc. — you control rotation, disable & destroy.",
            "Hierarchy: key ring (location) → key → key versions. Protection levels: Software, Cloud HSM (FIPS 140-2 Level 3), and External Key Manager (EKM).",
            "Contrast with CSEK (you supply the raw key, Google doesn't store it) and Google-managed default encryption.",
          ],
          security: [
            "roles/cloudkms.cryptoKeyEncrypterDecrypter; separation of duties between key admins & data users.",
            "Automatic key rotation; every crypto operation is audit-logged; envelope encryption (DEK wrapped by KEK).",
          ],
          operations: [
            "Regional / multi-region key rings for availability; scheduled rotation; destroy carries a 24h+ safety delay.",
          ],
          keywords: [
            "\"CMEK vs CSEK vs Google-managed\"",
            "\"Cloud HSM (FIPS 140-2 L3)\"",
            "\"EKM / external keys\"",
            "\"key rotation\"",
            "\"envelope encryption (DEK/KEK)\"",
            "\"separation of duties\"",
          ],
          antipatterns: [
            "Storing passwords / API keys → Secret Manager, not KMS (KMS is for cryptographic keys).",
            "Keys required physically outside Google → EKM, not standard software keys.",
          ],
        },
      },
      {
        id: "secret-manager",
        name: "Secret Manager",
        icon: "secret-manager",
        tagline: "Secrets & credential storage",
        detail: {
          design: [
            "Central, versioned store for secrets (API keys, passwords, certs). Replaces hardcoding secrets in code/config/env or dropping them in GCS.",
            "Global resource with automatic or user-managed replication; versioning + aliases support rotation.",
          ],
          security: [
            "roles/secretmanager.secretAccessor per-secret; encrypted at rest (CMEK optional); access is audit-logged.",
            "Rotation schedules with Pub/Sub notifications; accessed from Cloud Run/GKE/Functions via service account.",
          ],
          operations: [
            "Version pinning + a 'latest' alias; disable/destroy versions; multi-region replication for availability.",
          ],
          keywords: [
            "\"secrets / API keys / passwords\"",
            "\"versioned secrets & rotation\"",
            "\"secretAccessor least privilege\"",
            "\"don't hardcode / not in GCS\"",
            "\"CMEK on secrets\"",
          ],
          antipatterns: [
            "Cryptographic encryption keys → Cloud KMS.",
            "Large blobs / files → GCS (Secret Manager is for small secrets).",
          ],
        },
      },
      {
        id: "cloud-armor",
        name: "Cloud Armor",
        icon: "cloud-armor",
        tagline: "WAF & DDoS protection",
        pairings: ["cloud-lb"],
        detail: {
          design: [
            "Edge WAF & DDoS protection attached to the global external Application LB. Absorbs L3/L4 volumetric DDoS and L7 attacks (OWASP Top 10 preconfigured rules).",
            "Security policies allow/deny by IP/CIDR/geo, apply rate limiting (throttle/ban) and named IP lists.",
            "Adaptive Protection uses ML to detect anomalies; Managed Protection Plus tier for advanced DDoS.",
          ],
          security: [
            "Preconfigured rules (SQLi, XSS, LFI, RCE); custom rules via CEL expressions; bot management / reCAPTCHA integration.",
          ],
          operations: [
            "Preview mode tests rules without blocking; logs to Cloud Logging; per-rule metrics.",
          ],
          keywords: [
            "\"WAF + DDoS at the edge\"",
            "\"requires external Application LB\"",
            "\"OWASP preconfigured rules\"",
            "\"rate limiting / geo blocking\"",
            "\"Adaptive Protection (ML)\"",
            "\"preview mode\"",
          ],
          antipatterns: [
            "Internal / L4-only passthrough traffic → Cloud Armor needs the L7 external ALB.",
            "Application-layer authorization → use IAP/IAM, not WAF rules.",
          ],
        },
      },
      {
        id: "cloud-iap",
        name: "Identity-Aware Proxy (IAP)",
        icon: "cloud-iap",
        tagline: "Context-aware app access",
        pairings: ["cloud-run", "gce", "gke"],
        detail: {
          design: [
            "Identity-Aware Proxy enforces context-aware, per-request auth in front of apps (App Engine, Cloud Run, GCE, GKE via LB) and TCP forwarding (SSH/RDP) — a BeyondCorp zero-trust building block.",
            "Removes the need for a VPN: access is decided by user identity + device/context, not network location.",
            "Verify the user, then authorize with IAM (roles/iap.httpsResourceAccessor).",
          ],
          security: [
            "Integrates with Access Context Manager for device/IP/geo conditions; passes a signed JWT identity header to the backend.",
            "IAP TCP forwarding gives SSH/RDP to VMs with no public IP and no bastion host.",
          ],
          operations: [
            "Works with the external/internal LB; access is audit-logged; no infrastructure to run.",
          ],
          keywords: [
            "\"BeyondCorp / zero-trust\"",
            "\"context-aware access (no VPN)\"",
            "\"IAP TCP forwarding (SSH/RDP, no bastion)\"",
            "\"iap.httpsResourceAccessor\"",
            "\"identity + device context\"",
          ],
          antipatterns: [
            "Volumetric DDoS / WAF needs → Cloud Armor.",
            "Public unauthenticated content → IAP is for gated access.",
          ],
        },
      },
      {
        id: "cloud-identity",
        name: "Cloud Identity",
        icon: "cloud-identity",
        tagline: "Users, groups & SSO for Google Cloud",
        pairings: ["iam", "resource-manager", "service-accounts"],
        detail: {
          design: [
            "The IdP that holds your users and groups (the identities IAM grants roles to). An Organization resource requires Cloud Identity or Google Workspace.",
            "Sync from on-prem Active Directory with Google Cloud Directory Sync (GCDS); federate authentication with SAML SSO (e.g. via AD FS or another IdP).",
            "Best practice: grant IAM roles to groups, not individual users — manage membership in the IdP.",
          ],
          security: [
            "SSO (SAML) and GCDS are mutually exclusive mechanisms, though commonly used together (GCDS provisions, SSO authenticates).",
            "Enforce 2-Step Verification, security keys and context-aware access policies centrally.",
          ],
          operations: [
            "Free and Premium editions; Premium adds device management and advanced security controls.",
            "Deprovisioning a user in the IdP immediately revokes their Google Cloud access.",
          ],
          keywords: [
            "users & groups / identity provider",
            "GCDS syncs Active Directory",
            "SAML SSO federation",
            "required for an Organization",
            "grant roles to groups",
          ],
          antipatterns: [
            "Using it to authorize service-to-service calls → use service accounts + IAM.",
            "Hard-coding individual users on resources instead of groups.",
          ],
        },
      },
      {
        id: "resource-manager",
        name: "Resource Manager",
        icon: "resource-manager",
        tagline: "Org → Folders → Projects hierarchy",
        pairings: ["iam", "org-policy", "cloud-billing"],
        detail: {
          design: [
            "Defines the resource hierarchy: Organization → Folders → Projects → resources. This hierarchy is where IAM policies and Organization Policies are attached and inherited.",
            "Organizations and Folders are technically optional (folders can be nested); every resource belongs to exactly one project.",
            "Model folders on your org structure (departments, environments) so policy and access inherit cleanly downward.",
          ],
          security: [
            "IAM policy set at any level is inherited by everything below — set broad access high, least privilege low.",
            "Custom roles can be defined only at the organization or project level, not on folders.",
          ],
          operations: [
            "Projects are the unit of billing, quota and API enablement, and can be moved between folders.",
            "Use liens and deletion protection to prevent accidental project deletion.",
          ],
          keywords: [
            "Org / Folder / Project hierarchy",
            "policy inheritance",
            "single project per resource",
            "folders map to org structure",
            "unit of billing & quota",
          ],
          antipatterns: [
            "Flat structure with no folders when you need per-environment/department policy isolation.",
            "Expecting folder-level custom roles — not supported.",
          ],
        },
      },
      {
        id: "service-accounts",
        name: "Service Accounts",
        icon: "service-accounts",
        tagline: "Machine identities for workloads",
        pairings: ["iam", "gce", "cloud-identity"],
        detail: {
          design: [
            "Non-human identities that applications and VMs use to authenticate to Google Cloud APIs. Attach a least-privilege SA to a workload instead of using user credentials or keys.",
            "Prefer attached service accounts and Workload Identity (GKE) / Workload Identity Federation (external) over downloaded JSON keys — keys are a top exfiltration risk.",
            "Use short-lived credentials and impersonation rather than long-lived key files.",
          ],
          security: [
            "A service account is both an identity (granted roles) and a resource (users are granted roles ON it, e.g. Service Account User).",
            "The Service Account User role lets a principal act as the SA — if that SA is powerful, the user inherits its privileges (a classic privilege-escalation exam trap).",
          ],
          operations: [
            "Rotate/avoid keys; use IAM Recommender to trim over-broad grants.",
            "Audit usage via Cloud Audit Logs; disable rather than delete when off-boarding a workload.",
          ],
          keywords: [
            "workload / machine identity",
            "attach least-privilege SA to VM",
            "Workload Identity (Federation)",
            "avoid downloaded JSON keys",
            "Service Account User = escalation",
          ],
          antipatterns: [
            "Embedding long-lived SA key files in code/images.",
            "Using a single highly-privileged SA for everything.",
            "Using a service account for interactive human login → Cloud Identity users.",
          ],
        },
      },
      {
        id: "org-policy",
        name: "Organization Policy Service",
        icon: "org-policy",
        tagline: "Central guardrails on resource config",
        pairings: ["resource-manager", "iam", "compliance-mapping"],
        detail: {
          design: [
            "Sets guardrails (constraints) on how resources CAN be configured across the org — complements IAM, which controls WHO can act. Attached at org/folder/project and inherited downward.",
            "Common constraints: restrict external IPs on VMs, restrict resource locations (data residency), disable service-account key creation, enforce uniform bucket-level access, restrict which VPCs/shared-VPC can be used.",
            "The right tool when a case study says 'ensure no one can…' regardless of their IAM permissions.",
          ],
          security: [
            "Enforces preventative controls that even project owners cannot bypass (unlike IAM allow-policies).",
            "Boolean, list (allow/deny), and custom constraints; supports dry-run to test impact.",
          ],
          operations: [
            "Inheritance can be merged or overridden at lower levels where a delegation is intended.",
            "Pairs with Security Command Center to detect drift from your compliance posture.",
          ],
          keywords: [
            "guardrails / constraints",
            "restrict external IPs / locations",
            "disable SA key creation",
            "'no one can…' regardless of IAM",
            "data residency / sovereignty",
          ],
          antipatterns: [
            "Controlling who can access a resource → that's IAM, not Org Policy.",
            "Per-request runtime authorization of app users → IAP.",
          ],
        },
      },
      {
        id: "scc",
        name: "Security Command Center",
        icon: "scc",
        tagline: "Central security & risk dashboard",
        pairings: ["org-policy", "cloud-armor", "compliance-mapping"],
        detail: {
          design: [
            "The centralized security and risk management platform: asset inventory, misconfiguration and vulnerability findings, and threat detection across the organization.",
            "The answer when a case study needs a single tool to manage security posture and detect vulnerabilities (especially after past breaches / under strict regulation).",
            "Premium/Enterprise tiers add Event Threat Detection, Security Health Analytics, Web Security Scanner and compliance reports.",
          ],
          security: [
            "Surfaces public buckets, over-permissive IAM, open firewall rules, and known CVEs in your workloads.",
            "Integrates findings from Cloud Armor, VPC Service Controls and third-party tools.",
          ],
          operations: [
            "Export findings to Pub/Sub / SIEM for automated response; track posture against CIS/PCI/HIPAA benchmarks.",
            "Continuous scanning gives a live view of drift from your intended security posture.",
          ],
          keywords: [
            "central security posture / risk",
            "detect misconfigurations & vulnerabilities",
            "threat detection",
            "compliance dashboards",
            "asset inventory",
          ],
          antipatterns: [
            "Blocking L7 web attacks at the edge → Cloud Armor.",
            "Preventing misconfiguration in the first place → Organization Policy.",
          ],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. MANAGEMENT, OPERATIONS & TOOLS
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "management-ops",
    name: "Management, Operations & Tools",
    icon: "management",
    accent: "amber",
    services: [
      {
        id: "cloud-monitoring",
        name: "Cloud Monitoring",
        icon: "cloud-monitoring",
        tagline: "Metrics, dashboards & alerting",
        detail: {
          design: [
            "Metrics, dashboards, uptime checks & alerting (Cloud Operations, formerly Stackdriver). Collects platform + custom + OpenTelemetry / Prometheus metrics.",
            "SLO monitoring: define SLIs/SLOs & error budgets and alert on burn rate. Metrics scopes aggregate multiple projects into one pane.",
          ],
          security: [
            "roles/monitoring.viewer, roles/monitoring.editor; metrics-scope access control.",
          ],
          operations: [
            "Uptime checks + alerting policies to channels (PagerDuty, Slack, email, Pub/Sub); dashboards for the golden signals (latency, traffic, errors, saturation).",
            "MQL / PromQL queries; integrates with Managed Service for Prometheus.",
          ],
          keywords: [
            "\"metrics / dashboards / alerting / uptime checks\"",
            "\"SLO & error budget\"",
            "\"metrics scope (multi-project)\"",
            "\"golden signals\"",
            "\"Managed Prometheus\"",
          ],
          antipatterns: [
            "Full-text log search & investigation → Cloud Logging.",
            "Distributed request tracing → Cloud Trace.",
          ],
        },
      },
      {
        id: "cloud-logging",
        name: "Cloud Logging",
        icon: "cloud-logging",
        tagline: "Centralized log management",
        detail: {
          design: [
            "Centralized, real-time log management. The Log Router sends logs via sinks to BigQuery (analytics), GCS (archive/compliance), Pub/Sub (stream), or another project.",
            "Log buckets with configurable retention; _Required (400d, immutable) & _Default sinks. Log-based metrics feed Monitoring alerts.",
          ],
          security: [
            "roles/logging.viewer, roles/logging.logWriter; CMEK on log buckets; Audit Logs (Admin Activity always on; Data Access opt-in).",
            "Log Analytics (BigQuery-backed) enables SQL over logs.",
          ],
          operations: [
            "Sink inclusion/exclusion filters control cost; retention & locked buckets give immutable compliance storage.",
          ],
          keywords: [
            "\"log router / sinks → BigQuery / GCS / Pub/Sub\"",
            "\"log-based metrics\"",
            "\"audit logs (Admin Activity vs Data Access)\"",
            "\"retention & locked buckets\"",
            "\"export for compliance\"",
          ],
          antipatterns: [
            "Time-series metric alerting → Cloud Monitoring (log-based metrics bridge the gap).",
            "Cheap long-term archive kept in log buckets → export to GCS Coldline/Archive.",
          ],
        },
      },
      {
        id: "cloud-build",
        name: "Cloud Build",
        icon: "cloud-build",
        tagline: "Managed CI/CD builds",
        detail: {
          design: [
            "Serverless CI/CD engine: run builds/tests, build container images and deploy. Steps run as containers defined in cloudbuild.yaml; triggers fire on repo push/PR/tag.",
            "Integrates with Artifact Registry, GKE, Cloud Run and Binary Authorization (attestations) for a secure software supply chain.",
          ],
          security: [
            "Runs as a Cloud Build service account (scope it down); Binary Authorization + SLSA provenance attestations; store secrets in Secret Manager, not build config.",
          ],
          operations: [
            "Managed autoscaling build workers; private / worker pools for VPC or on-prem access; build caching for speed.",
          ],
          keywords: [
            "\"serverless CI/CD\"",
            "\"cloudbuild.yaml steps as containers\"",
            "\"triggers on push / PR\"",
            "\"Artifact Registry + Binary Authorization\"",
            "\"private / worker pools\"",
            "\"SLSA / provenance\"",
          ],
          antipatterns: [
            "Release orchestration/promotion across environments → Cloud Deploy.",
            "General long-running compute → not a compute platform.",
          ],
        },
      },
      {
        id: "cloud-deploy",
        name: "Cloud Deploy",
        icon: "cloud-deploy",
        tagline: "Managed continuous delivery",
        detail: {
          design: [
            "Managed continuous delivery: define a pipeline that promotes a release through targets (dev → staging → prod) for GKE, Cloud Run & Anthos.",
            "Adds approvals, automated canary / gradual rollouts and one-click rollback. Separates 'build the artifact' (Cloud Build) from 'promote & deploy it'.",
          ],
          security: [
            "IAM gates + required approvals per target; per-target execution service accounts; full audit trail of promotions.",
          ],
          operations: [
            "Deploy history, rollback to a prior release, verification jobs; canary percentages & phased rollout.",
          ],
          keywords: [
            "\"managed continuous delivery\"",
            "\"promotion pipeline dev → staging → prod\"",
            "\"approvals & canary\"",
            "\"one-click rollback\"",
            "\"GKE / Cloud Run targets\"",
          ],
          antipatterns: [
            "Building / testing images → Cloud Build (Deploy consumes the artifacts).",
            "A single ad-hoc manual deploy → a full pipeline may be overkill.",
          ],
        },
      },
      {
        id: "iac",
        name: "Infrastructure Manager",
        icon: "iac",
        tagline: "Terraform-based IaC",
        detail: {
          design: [
            "Managed Terraform service (Infrastructure Manager) to provision GCP infrastructure as code declaratively, with state managed by Google — repeatable, version-controlled environments.",
            "Preferred over the legacy Deployment Manager; store configs in a repo and apply via pipelines. Config Connector manages GCP resources the Kubernetes way.",
          ],
          security: [
            "Runs as a scoped service account; state is stored & managed by the service; policy validation via OPA / Policy Controller.",
          ],
          operations: [
            "Reproducible deployments with plan/apply drift detection; integrate with Cloud Build for GitOps.",
          ],
          keywords: [
            "\"Terraform / IaC\"",
            "\"Infrastructure Manager (managed Terraform)\"",
            "\"declarative repeatable environments\"",
            "\"Deployment Manager is legacy\"",
            "\"GitOps / drift detection\"",
          ],
          antipatterns: [
            "Imperative one-off console changes in prod → use IaC for reproducibility.",
            "Application CD (containers) → Cloud Deploy, not infra provisioning.",
          ],
        },
      },
      {
        id: "dms",
        name: "Database Migration Service",
        icon: "dms",
        tagline: "Near-zero-downtime DB migration",
        pairings: ["cloud-sql"],
        detail: {
          design: [
            "Managed, near-zero-downtime migrations to Cloud SQL / AlloyDB / Spanner. Homogeneous (MySQL→Cloud SQL) & heterogeneous (Oracle/PostgreSQL) via continuous replication (CDC).",
            "Serverless; uses native replication for a minimal-downtime cutover and validates before promotion.",
          ],
          security: [
            "Private connectivity (VPC peering / Private Service Connect); IAM-controlled; encrypted in transit.",
          ],
          operations: [
            "Continuous CDC keeps the target in sync until cutover; monitor replication lag; promote to finalize.",
          ],
          keywords: [
            "\"near-zero-downtime migration\"",
            "\"homogeneous vs heterogeneous\"",
            "\"continuous replication / CDC\"",
            "\"to Cloud SQL / AlloyDB / Spanner\"",
            "\"private connectivity\"",
          ],
          antipatterns: [
            "Bulk one-time analytics load → BigQuery Data Transfer / batch load.",
            "Migrating to an unsupported engine → check supported sources/targets.",
          ],
        },
      },
      {
        id: "ops-suite",
        name: "Cloud Operations Suite",
        icon: "ops-suite",
        tagline: "Monitoring, logging, tracing, SRE",
        pairings: ["cloud-monitoring", "cloud-logging", "audit-logs"],
        detail: {
          design: [
            "The umbrella observability stack (formerly Stackdriver): Cloud Monitoring, Cloud Logging, Cloud Trace, Cloud Profiler and Error Reporting — the basis for SRE practice on Google Cloud.",
            "Define SLIs and SLOs, dashboards, uptime checks and alerting policies with real notification channels (not just email).",
            "The modernization answer when a case study relies on ignored email alerts or fragmented on-prem monitoring (Nagios/Grafana/Prometheus).",
          ],
          security: [
            "Integrates Cloud Audit Logs for who-did-what; supports log-based metrics and alerting on security events.",
            "Managed Service for Prometheus ingests existing Prometheus metrics without self-managed servers.",
          ],
          operations: [
            "Uptime checks + alerting on SLO burn rate catch incidents proactively.",
            "Cloud Trace (latency), Cloud Profiler (CPU/heap) and Error Reporting (exception grouping) close the loop on performance.",
          ],
          keywords: [
            "SLIs / SLOs / SLAs",
            "uptime checks & alerting policies",
            "dashboards + notification channels",
            "Managed Service for Prometheus",
            "trace / profiler / error reporting",
          ],
          antipatterns: [
            "Long-term immutable audit retention/export → route Audit Logs to Cloud Storage/BigQuery.",
            "Edge attack protection → Cloud Armor (different concern).",
          ],
        },
      },
      {
        id: "audit-logs",
        name: "Cloud Audit Logs",
        icon: "audit-logs",
        tagline: "Who did what, where and when",
        pairings: ["cloud-logging", "iam", "compliance-mapping"],
        detail: {
          design: [
            "Records administrative and data-access activity across Google Cloud: Admin Activity, Data Access, System Event and Policy Denied logs.",
            "Admin Activity logs are always on and free; Data Access logs (except BigQuery) are opt-in and can be high-volume.",
            "The compliance backbone for answering 'who changed / accessed this resource'.",
          ],
          security: [
            "Immutable and separated by IAM — access controlled via Logging roles distinct from the resources being audited.",
            "Enable Data Access logs on sensitive services to meet regulatory audit requirements.",
          ],
          operations: [
            "Logs are retained ~400 days in the _Required bucket; export via log sinks to Cloud Storage, BigQuery or Pub/Sub for longer retention and analysis.",
            "Build log-based metrics and alerts on suspicious admin actions.",
          ],
          keywords: [
            "who did what, when",
            "Admin Activity (always on) vs Data Access (opt-in)",
            "export sinks to GCS / BigQuery / Pub/Sub",
            "regulatory audit trail",
          ],
          antipatterns: [
            "Application/debug logs → Cloud Logging (app logs), not audit logs.",
            "Relying on default retention for multi-year compliance without an export sink.",
          ],
        },
      },
      {
        id: "artifact-registry",
        name: "Artifact Registry",
        icon: "artifact-registry",
        tagline: "Managed container & package repo",
        pairings: ["cloud-build", "gke", "cloud-deploy"],
        detail: {
          design: [
            "The successor to Container Registry: a single managed home for container images AND language packages (Maven, npm, Python, apt/yum) with regional repositories.",
            "Central artifact store in a modern CI/CD pipeline (Cloud Build → Artifact Registry → Cloud Deploy → GKE/Cloud Run).",
            "Prefer it over Container Registry for new work — finer-grained IAM, more formats, and regional control.",
          ],
          security: [
            "Per-repository IAM (vs GCR's bucket-based access); integrates with Binary Authorization to allow only trusted, signed images to deploy.",
            "Vulnerability scanning on pushed images; CMEK supported.",
          ],
          operations: [
            "Regional/multi-regional repos reduce pull latency and egress; supports remote & virtual repositories for upstream caching.",
            "Cleanup policies expire old versions to control storage cost.",
          ],
          keywords: [
            "container images + packages",
            "successor to Container Registry",
            "per-repo IAM",
            "Binary Authorization + vuln scanning",
            "regional repositories",
          ],
          antipatterns: [
            "Storing large binary build outputs/backups → Cloud Storage.",
            "Sticking with Container Registry for new pipelines (being deprecated).",
          ],
        },
      },
      {
        id: "cloud-shell",
        name: "Cloud Shell & SDK",
        icon: "cloud-shell",
        tagline: "Browser CLI and gcloud tooling",
        pairings: ["cloud-build", "iac"],
        detail: {
          design: [
            "Cloud Shell is a free, browser-based ephemeral VM pre-loaded with the gcloud CLI, kubectl, Terraform, editors and 5 GB of persistent $HOME — instant admin access with no local setup.",
            "The Cloud SDK (gcloud, gsutil, bq) is the scriptable interface to Google Cloud for automation and CI.",
            "Use for quick admin, labs, and file up/download to/from your local machine via the browser.",
          ],
          security: [
            "Runs as your identity with your IAM permissions; no keys to manage in the browser session.",
            "Ephemeral compute is recycled after inactivity — nothing sensitive persists on the VM beyond $HOME.",
          ],
          operations: [
            "Great for one-off operations and troubleshooting; for repeatable infra prefer IaC (Terraform / Infrastructure Manager).",
            "gcloud config configurations switch between projects/accounts quickly.",
          ],
          keywords: [
            "browser-based CLI",
            "gcloud / gsutil / bq",
            "no local setup",
            "up/download files to local",
            "ephemeral VM + 5 GB home",
          ],
          antipatterns: [
            "Running production workloads on the ephemeral Cloud Shell VM.",
            "Manual clicks/commands for infra that should be codified → IaC.",
          ],
        },
      },
      {
        id: "cloud-billing",
        name: "Cloud Billing",
        icon: "cloud-billing",
        tagline: "Accounts, budgets & cost export",
        pairings: ["resource-manager", "cost-optimization", "bigquery"],
        detail: {
          design: [
            "A Billing Account pays for one or more projects; projects with different billing accounts are billed separately — a lever for chargeback and cost isolation.",
            "Set budgets with threshold alerts per project or account; export detailed billing data to BigQuery for analysis.",
            "The answer for cost visibility, chargeback, and preventing per-project/per-developer budget overrun.",
          ],
          security: [
            "Billing IAM roles (Billing Account Admin/User) are separate from resource IAM — separation of financial and technical duties.",
            "Link/unlink projects to control who can incur spend.",
          ],
          operations: [
            "Budgets trigger alerts (and optional Pub/Sub automation) but do NOT hard-cap spend by default.",
            "BigQuery billing export + Looker/Data Studio dashboards give granular cost attribution by label.",
          ],
          keywords: [
            "billing account vs project",
            "budgets & threshold alerts",
            "billing export to BigQuery",
            "chargeback / separate billing",
            "cost by label",
          ],
          antipatterns: [
            "Expecting budgets to automatically stop spend — they alert, not cap.",
            "Using resource IAM roles to control billing access.",
          ],
        },
      },
      {
        id: "storage-transfer",
        name: "Storage Transfer Service",
        icon: "storage-transfer",
        tagline: "Managed online data transfer to GCS",
        pairings: ["cloud-storage", "transfer-appliance", "migration-path"],
        detail: {
          design: [
            "Managed, scheduled, online transfer of large datasets into Cloud Storage — from other clouds (S3/Azure), from on-prem file systems, or between GCS buckets.",
            "Use when the network can move the data in reasonable time; supports incremental syncs, filters and bandwidth control.",
            "For on-prem, the Transfer Service for on-premises agent handles very large file-system transfers.",
          ],
          security: [
            "Runs as a Google-managed service with IAM-scoped access to source and destination.",
            "Preserves metadata; supports delete-after-transfer and overwrite policies.",
          ],
          operations: [
            "Scheduling + incremental copies keep buckets in sync (e.g. recurring cross-cloud replication).",
            "Managed retries and integrity checks — no self-built gsutil scripting to maintain.",
          ],
          keywords: [
            "online transfer to Cloud Storage",
            "from S3 / Azure / on-prem",
            "scheduled & incremental sync",
            "bucket-to-bucket migration",
          ],
          antipatterns: [
            "Petabytes where the network would take months → Transfer Appliance (offline).",
            "Live relational database migration → Database Migration Service.",
          ],
        },
      },
      {
        id: "transfer-appliance",
        name: "Transfer Appliance",
        icon: "transfer-appliance",
        tagline: "Offline bulk data shipping",
        pairings: ["cloud-storage", "storage-transfer", "migration-path"],
        detail: {
          design: [
            "A physical, ruggedized storage device Google ships to you; you fill it and ship it back, and the data is loaded into Cloud Storage — the answer when data is huge and bandwidth is the bottleneck.",
            "Classic exam trigger: hundreds of TB / PB that would take weeks-to-months over the available uplink.",
            "Capacities from tens to hundreds of TB per appliance; order multiple for larger jobs.",
          ],
          security: [
            "Data is encrypted on the appliance with a customer-held key; it cannot be read without your key.",
            "Chain-of-custody handling to the ingest facility.",
          ],
          operations: [
            "Timeline is dominated by shipping, not network — plan for transit days.",
            "After ingest, use Storage Transfer Service for ongoing incremental syncs.",
          ],
          keywords: [
            "offline / physical shipping",
            "petabytes, bandwidth-constrained",
            "weeks/months over the network",
            "encrypted appliance",
          ],
          antipatterns: [
            "Data the network can move in reasonable time → Storage Transfer Service (online).",
            "Ongoing continuous replication → an online transfer, not a one-time appliance.",
          ],
        },
      },
      {
        id: "migrate-to-vms",
        name: "Migrate to Virtual Machines",
        icon: "migrate-to-vms",
        tagline: "Lift-and-shift servers to Compute Engine",
        pairings: ["gce", "cloud-interconnect", "migration-path"],
        detail: {
          design: [
            "Google's tool (formerly Migrate for Compute Engine / Velostrata) to rehost physical servers and VMs from on-prem, VMware, AWS or Azure onto Compute Engine with minimal downtime.",
            "The 'lift-and-shift / rehost' answer: stream the workload up, cut over quickly, then modernize afterward (re-platform to managed services or containers).",
            "Supports wave-based migration of many VMs and test-clones a workload for validation before the production cutover.",
          ],
          security: [
            "Runs migrations over a private link (VPN/Interconnect) with IAM-scoped service accounts; no migration agents remain baked into the final image.",
            "Test-clone into an isolated VPC to validate before touching production.",
          ],
          operations: [
            "Streaming migration keeps the source running while data replicates, so cutover downtime is short.",
            "Group VMs into migration waves and roll back cleanly if validation fails.",
          ],
          keywords: [
            "rehost / lift-and-shift VMs",
            "on-prem / VMware / AWS / Azure → Compute Engine",
            "minimal-downtime streaming migration",
            "wave-based, test-clone before cutover",
            "formerly Migrate for Compute Engine / Velostrata",
          ],
          antipatterns: [
            "Near-zero-downtime database migration → Database Migration Service.",
            "Moving bulk file/object data → Storage Transfer Service / Transfer Appliance.",
            "Re-architecting to containers up front → GKE / Cloud Run (this is rehost, not refactor).",
          ],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. DATA ANALYTICS & AI / ML
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-ai",
    name: "Data Analytics & AI / ML",
    icon: "data-ai",
    accent: "cyan",
    services: [
      {
        id: "pubsub",
        name: "Cloud Pub/Sub",
        icon: "pubsub",
        tagline: "Global async messaging",
        pairings: ["dataflow", "bigquery", "bigtable"],
        detail: {
          design: [
            "Global, serverless async messaging (publish/subscribe) that decouples producers from consumers; scales to millions of messages/sec. Backbone of event-driven & streaming ingestion.",
            "At-least-once delivery (exactly-once available); pull & push subscriptions; ordering keys for ordered delivery; dead-letter topics.",
            "Pub/Sub Lite for cost-optimized, zonal high-volume. Classic pipeline: Pub/Sub → Dataflow → BigQuery / Bigtable.",
          ],
          security: [
            "roles/pubsub.publisher, roles/pubsub.subscriber; CMEK; VPC Service Controls; encryption at rest.",
          ],
          operations: [
            "Global by default with automatic scaling & storage; snapshots + retention enable seek/replay; monitor subscription backlog / oldest-unacked-age.",
          ],
          keywords: [
            "\"async pub/sub messaging\"",
            "\"decouple producers / consumers\"",
            "\"at-least-once (exactly-once option)\"",
            "\"ordering keys / dead-letter\"",
            "\"Pub/Sub → Dataflow → BigQuery\"",
            "\"Pub/Sub Lite\"",
          ],
          antipatterns: [
            "Synchronous request/response → use an API / LB, not Pub/Sub.",
            "Strict global ordering across all messages → ordering is per-key only.",
          ],
        },
      },
      {
        id: "dataflow",
        name: "Cloud Dataflow",
        icon: "dataflow",
        tagline: "Serverless stream & batch (Beam)",
        pairings: ["pubsub", "bigquery", "cloud-storage", "bigtable"],
        detail: {
          design: [
            "Serverless, autoscaling stream + batch processing built on Apache Beam — one model for both. Ideal for ETL, real-time analytics and Pub/Sub → BigQuery pipelines.",
            "Handles windowing, watermarks & late data for correct streaming aggregation. Templates (incl. Google-provided) for common jobs; Dataflow Prime adds smart autoscaling.",
            "Choose over Dataproc when you want serverless (no cluster) and unified batch/stream.",
          ],
          security: [
            "Runs as a least-privilege controller service account; CMEK; VPC / private IPs; VPC Service Controls.",
          ],
          operations: [
            "Horizontal & vertical autoscaling; drain (vs cancel) for graceful pipeline updates; monitor system lag & data freshness.",
          ],
          keywords: [
            "\"serverless Beam / unified batch + stream\"",
            "\"windowing / watermarks / late data\"",
            "\"Pub/Sub → Dataflow → BigQuery\"",
            "\"templates\"",
            "\"drain to update\"",
            "\"vs Dataproc (existing Spark)\"",
          ],
          antipatterns: [
            "Lift-and-shift of existing Spark/Hadoop → Dataproc.",
            "Simple scheduled SQL transforms → BigQuery scheduled queries / Dataform.",
          ],
        },
      },
      {
        id: "dataproc",
        name: "Cloud Dataproc",
        icon: "dataproc",
        tagline: "Managed Spark & Hadoop",
        detail: {
          design: [
            "Managed Spark & Hadoop (plus Presto, Hive, etc.) — fast cluster provisioning for lift-and-shift of existing OSS big-data jobs.",
            "Use ephemeral, job-scoped clusters + autoscaling and GCS as storage (decouple compute/storage) instead of HDFS. Dataproc Serverless runs Spark with no cluster.",
            "Choose over Dataflow when you already have Spark/Hadoop code & skills.",
          ],
          security: [
            "Kerberos / secure clusters; IAM; CMEK; component gateway; runs inside your VPC.",
          ],
          operations: [
            "Autoscaling policies; create → run → delete ephemeral clusters to save cost; Spot VMs for workers; init actions for customization.",
          ],
          keywords: [
            "\"managed Spark / Hadoop\"",
            "\"lift-and-shift OSS big data\"",
            "\"ephemeral clusters + GCS (not HDFS)\"",
            "\"Dataproc Serverless\"",
            "\"vs Dataflow (new serverless)\"",
          ],
          antipatterns: [
            "Greenfield serverless streaming → Dataflow.",
            "Interactive SQL warehouse analytics → BigQuery.",
          ],
        },
      },
      {
        id: "looker",
        name: "Looker",
        icon: "looker",
        tagline: "Enterprise BI & modeling",
        pairings: ["bigquery"],
        detail: {
          design: [
            "Enterprise BI & governed data-modeling platform. LookML defines a single semantic model / source of truth on top of BigQuery (and other warehouses).",
            "In-database architecture (queries pushed down to the warehouse); embedded analytics & data apps via API. Looker Studio (free) covers lightweight self-serve dashboards.",
          ],
          security: [
            "IAM + Looker roles; row/column-level access controls in LookML; SSO / OAuth.",
          ],
          operations: [
            "Version-controlled LookML (Git); PDTs / aggregate awareness for performance; scheduled deliveries.",
          ],
          keywords: [
            "\"governed BI / LookML semantic model\"",
            "\"single source of truth\"",
            "\"in-database (pushes to BigQuery)\"",
            "\"Looker vs Looker Studio\"",
            "\"embedded analytics\"",
          ],
          antipatterns: [
            "Raw data processing / ETL → Dataflow / Dataproc.",
            "Ad-hoc one-off free dashboards → Looker Studio may suffice.",
          ],
        },
      },
      {
        id: "vertex-ai",
        name: "Vertex AI",
        icon: "vertex-ai",
        tagline: "Unified ML + generative-AI platform",
        pairings: ["bigquery", "ai-apis", "cloud-storage"],
        detail: {
          design: [
            "Unified platform spanning the full lifecycle: data → training (AutoML or custom) → Model Registry → deployment (endpoints) → Model Monitoring. Feature Store, Pipelines (Kubeflow/TFX) & Workbench notebooks; batch & online prediction. AutoML for speed, custom training for control.",
            "Generative AI: Gemini (multimodal) plus Model Garden (Gemini, Gemma, Llama, Claude & OSS models). Grounding (with Google Search or your own data) and the RAG Engine cut hallucination by anchoring answers to enterprise data.",
            "Ship genAI apps with Vertex AI Agent Builder + Agent Engine (deploy & scale agents) and Vertex AI Search — the managed path for enterprise RAG chatbots and semantic search.",
          ],
          security: [
            "IAM; CMEK; VPC Service Controls & Private Service Connect endpoints; data residency. Your prompts/data are not used to train Google's foundation models; DLP-de-identify sensitive inputs.",
          ],
          operations: [
            "Managed endpoints with autoscaling; Model Monitoring detects training/serving skew & drift; Pipelines give reproducible MLOps; provisioned throughput for predictable genAI latency & cost.",
          ],
          keywords: [
            "\"unified ML + genAI platform / MLOps\"",
            "\"AutoML vs custom training\"",
            "\"Gemini / Model Garden\"",
            "\"Grounding + RAG Engine (reduce hallucination)\"",
            "\"Agent Builder / Vertex AI Search\"",
            "\"model monitoring (skew / drift)\"",
          ],
          antipatterns: [
            "Common perception task (OCR, transcription, translation, sentiment) → a pre-trained AI API beats building a model.",
            "Simple SQL-based predictions on warehouse data → BigQuery ML may be simpler.",
            "Non-ML data transforms → Dataflow.",
          ],
        },
      },
      {
        id: "ai-apis",
        name: "Pre-trained AI APIs",
        icon: "ai-apis",
        tagline: "Ready-made ML via API",
        pairings: ["vertex-ai"],
        detail: {
          design: [
            "Google-trained models exposed as simple REST/gRPC APIs — no ML expertise, training data or infrastructure needed. The default when your problem is a common one: Vision AI (labels/OCR/faces), Video Intelligence, Speech-to-Text & Text-to-Speech, Cloud Translation, Natural Language (entities/sentiment/syntax).",
            "Document AI extracts structured data from forms, invoices & IDs (OCR + parsing); Contact Center AI (CCAI) powers virtual agents & agent assist; Recommendations AI / Discovery for retail search & personalization.",
            "Decision ladder: pre-trained API (common task) → AutoML (your labeled data, no ML skills) → custom training on Vertex AI (full control). Move up a rung only when the tier below can't meet accuracy or customization needs.",
          ],
          security: [
            "IAM per API; encryption in transit; VPC Service Controls; requests aren't used to train Google's models; DLP-de-identify sensitive text before sending.",
          ],
          operations: [
            "Fully managed & serverless — pay per request/character/minute, no endpoints to scale; async batch modes for large jobs; quota-based scaling.",
          ],
          keywords: [
            "\"pre-trained / ready-made API (no training)\"",
            "\"Vision / Speech / Translation / Natural Language\"",
            "\"Document AI (form / invoice parsing)\"",
            "\"Contact Center AI (CCAI)\"",
            "\"API → AutoML → custom training ladder\"",
            "\"common task = don't build a model\"",
          ],
          antipatterns: [
            "Domain-specific labels a generic API misses → AutoML or custom training.",
            "Full MLOps lifecycle / model governance → Vertex AI.",
            "Generative / reasoning tasks → Gemini on Vertex AI, not the classic perception APIs.",
          ],
        },
      },
      {
        id: "composer",
        name: "Cloud Composer",
        icon: "composer",
        tagline: "Managed Airflow orchestration",
        detail: {
          design: [
            "Managed Apache Airflow for authoring, scheduling & monitoring workflows (DAGs) — orchestrates multi-step, cross-service data pipelines (e.g. GCS → Dataflow → BigQuery → notify).",
            "Choose for complex dependency-based orchestration with retries, backfills & scheduling; use Workflows (serverless) for lighter service orchestration.",
          ],
          security: [
            "IAM; runs in your VPC; Private IP environments; CMEK; Secret Manager for connections.",
          ],
          operations: [
            "Managed Airflow environment (GKE-backed); autoscaling (Composer 2); monitor DAG runs & task retries.",
          ],
          keywords: [
            "\"managed Airflow / DAG orchestration\"",
            "\"multi-step pipeline scheduling\"",
            "\"retries & backfills\"",
            "\"Composer vs Workflows\"",
            "\"cross-service orchestration\"",
          ],
          antipatterns: [
            "A simple single event trigger → function / Pub/Sub or Workflows, not a full Airflow environment.",
            "The data processing itself → Dataflow / Dataproc (Composer orchestrates, it doesn't crunch).",
          ],
        },
      },
      {
        id: "datafusion",
        name: "Cloud Data Fusion",
        icon: "datafusion",
        tagline: "Visual ETL / ELT pipelines",
        detail: {
          design: [
            "Fully managed, code-free visual ETL/ELT (built on open-source CDAP) — drag-and-drop pipelines with 150+ connectors for hybrid/multi-cloud ingestion.",
            "Good for data engineers/analysts wanting graphical pipeline building; executes on ephemeral Dataproc under the hood, with built-in lineage & metadata.",
          ],
          security: [
            "IAM; private IP instances; CMEK; VPC Service Controls; pipelines run in your project.",
          ],
          operations: [
            "Versioned pipelines; scheduling & triggers; monitoring plus data lineage; scales via Dataproc.",
          ],
          keywords: [
            "\"code-free visual ETL / ELT\"",
            "\"CDAP-based / 150+ connectors\"",
            "\"runs on ephemeral Dataproc\"",
            "\"built-in lineage & metadata\"",
            "\"hybrid / multi-cloud ingestion\"",
          ],
          antipatterns: [
            "Complex custom streaming logic → Dataflow (Beam).",
            "Pure orchestration of existing jobs → Cloud Composer.",
          ],
        },
      },
      {
        id: "eventarc",
        name: "Eventarc",
        icon: "eventarc",
        tagline: "Route CloudEvents to serverless targets",
        pairings: ["pubsub", "cloud-run", "cloud-functions"],
        detail: {
          design: [
            "A managed eventing layer that delivers events as CloudEvents from 90+ Google Cloud sources (Cloud Storage, Firestore, BigQuery, Pub/Sub, Audit Logs) to targets like Cloud Run, Cloud Functions and GKE.",
            "The glue for event-driven architectures: 'when X happens in GCP, run this handler' — without writing polling or plumbing.",
            "Two source types: direct provider events, and Audit-Log-based events that fire on any admin/data-access activity you can audit.",
          ],
          security: [
            "Uses a per-trigger service account with least-privilege IAM; events are delivered over Google's network.",
            "Audit-Log-based triggers let you react to sensitive actions (e.g. a bucket made public) for automated remediation.",
          ],
          operations: [
            "Built on Pub/Sub under the hood — retries with at-least-once delivery; add a dead-letter topic for poison events.",
            "Event filters route only what each target cares about, keeping handlers focused.",
          ],
          keywords: [
            "\"when a file lands / a row is written, trigger…\"",
            "CloudEvents from 90+ sources",
            "Audit-Log-based triggers",
            "targets: Cloud Run / Functions / GKE",
            "event-driven, no polling",
          ],
          antipatterns: [
            "High-throughput app-to-app messaging you fully control → Pub/Sub directly.",
            "Scheduled / time-based jobs → Cloud Scheduler, not event triggers.",
          ],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. DECISION GUIDES (cross-cutting "which one when?" comparison matrices)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "decision-guides",
    name: "Decision Guides",
    icon: "decision-guides",
    accent: "fuchsia",
    services: [
      {
        id: "hybrid-connectivity",
        name: "On-prem ↔ VPC Connectivity",
        icon: "hybrid-connectivity",
        tagline: "VPN vs Interconnect vs Peering — which link?",
        pairings: ["cloud-interconnect", "vpc"],
        matrix: {
          question:
            "How should I connect an on-premises network to a Google Cloud VPC?",
          columns: [
            { key: "enc", label: "Encrypted?" },
            { key: "bw", label: "Bandwidth" },
            { key: "sla", label: "SLA" },
            { key: "rfc", label: "Private RFC1918" },
            { key: "setup", label: "Setup speed" },
          ],
          rows: [
            {
              option: "HA VPN",
              cells: {
                enc: "✅ IPsec",
                bw: "≤ ~3 Gbps / tunnel",
                sla: "99.99%",
                rfc: "✅",
                setup: "Fast (hours)",
              },
              pickWhen:
                "Encrypted connectivity over the public internet, quick to deploy, moderate bandwidth — or as an encrypted backup to Interconnect.",
            },
            {
              option: "Classic VPN",
              cells: {
                enc: "✅ IPsec",
                bw: "~1.5–3 Gbps",
                sla: "99.9%",
                rfc: "✅",
                setup: "Fast (hours)",
              },
              pickWhen:
                "Legacy single-tunnel VPN. Prefer HA VPN for anything new — it has the higher 99.99% SLA.",
            },
            {
              option: "Partner Interconnect",
              cells: {
                enc: "❌ (private)",
                bw: "50 Mbps – 50 Gbps",
                sla: "99.9% / 99.99%",
                rfc: "✅",
                setup: "Medium (via provider)",
              },
              pickWhen:
                "Private, higher bandwidth than VPN, but you have NO presence in a Google colocation facility — you connect through a supported service provider.",
            },
            {
              option: "Dedicated Interconnect",
              cells: {
                enc: "❌ (add MACsec)",
                bw: "10 / 100 Gbps links",
                sla: "99.9% / 99.99%",
                rfc: "✅",
                setup: "Slow (weeks, colo)",
              },
              pickWhen:
                "Highest, most consistent bandwidth and lowest latency to on-prem, and you CAN meet Google in a colocation facility.",
            },
            {
              option: "Cross-Cloud Interconnect",
              cells: {
                enc: "❌ (MACsec option)",
                bw: "10 / 100 Gbps",
                sla: "99.9% / 99.99%",
                rfc: "✅ (to other cloud)",
                setup: "Medium–Slow",
              },
              pickWhen:
                "Dedicated private link between Google and another cloud (AWS / Azure / OCI) for multicloud connectivity.",
            },
          ],
          traps: [
            "Direct/Carrier Peering does NOT give private RFC1918 access to your VPC — it only reaches Google/Workspace public APIs. Never pick peering for on-prem ↔ VPC traffic.",
            "Interconnect is private but NOT encrypted by default. If the requirement says 'encrypted', use VPN (or add MACsec / application-layer encryption).",
            "HA VPN only reaches 99.99% when configured with two tunnels to two peer devices (redundant).",
          ],
          keywords: [
            "\"encrypted\" / \"over the internet\" → VPN",
            "\"private, high & consistent bandwidth, low latency\" → Dedicated Interconnect",
            "\"no colo presence\" but want private → Partner Interconnect",
            "\"quick to set up\" / \"in a few days\" → HA VPN",
            "\"to another cloud\" → Cross-Cloud Interconnect",
          ],
        },
      },
      {
        id: "vpc-connectivity",
        name: "VPC ↔ VPC Connectivity",
        icon: "vpc-connectivity",
        tagline: "Peering vs Shared VPC vs NCC vs PSC",
        pairings: ["vpc", "vpc-sc"],
        matrix: {
          question: "How should I connect two (or many) VPC networks?",
          columns: [
            { key: "trans", label: "Transitive routing" },
            { key: "scope", label: "Cross-project / org" },
            { key: "enc", label: "Encryption" },
            { key: "scale", label: "Scale / admin" },
          ],
          rows: [
            {
              option: "VPC Peering",
              cells: {
                trans: "❌ non-transitive",
                scope: "✅ project & org",
                enc: "Internal (Google network)",
                scale: "Point-to-point, no central mgmt",
              },
              pickWhen:
                "Directly connect a few VPCs privately at full internal bandwidth. Simple and low cost — but non-transitive and CIDRs must not overlap.",
            },
            {
              option: "Shared VPC",
              cells: {
                trans: "n/a (one network)",
                scope: "✅ host → service (same org)",
                enc: "Internal (Google network)",
                scale: "Centralized network admin",
              },
              pickWhen:
                "One team owns networking and multiple projects share subnets in a single VPC. Central control with IAM separation, within one organization.",
            },
            {
              option: "HA VPN (VPC-to-VPC)",
              cells: {
                trans: "❌ (routes exchanged)",
                scope: "✅ even across orgs",
                enc: "✅ IPsec",
                scale: "Tunnels",
              },
              pickWhen:
                "Connect VPCs across organizations, or where you specifically want encryption / route control between them.",
            },
            {
              option: "Network Connectivity Center",
              cells: {
                trans: "✅ hub-and-spoke",
                scope: "✅ project & org",
                enc: "Depends on spoke type",
                scale: "Many VPCs + hybrid, centrally",
              },
              pickWhen:
                "Connect MANY VPCs (and hybrid links) with transitive connectivity through a central hub.",
            },
            {
              option: "Private Service Connect",
              cells: {
                trans: "n/a",
                scope: "✅ consumer → producer",
                enc: "Private",
                scale: "Per-service endpoints",
              },
              pickWhen:
                "Consume one published service across VPCs privately, without full network connectivity or route/CIDR coupling.",
            },
          ],
          traps: [
            "VPC Peering is NON-transitive: if A↔B and B↔C are peered, A cannot reach C through B. Use Network Connectivity Center for transitive hub-and-spoke.",
            "Peered VPCs cannot have overlapping IP (CIDR) ranges.",
            "Shared VPC is within a single organization; to join VPCs across organizations use HA VPN or NCC.",
          ],
          keywords: [
            "\"many VPCs\" / \"transitive\" / \"hub-and-spoke\" → Network Connectivity Center",
            "\"central network team\" / \"share subnets\" → Shared VPC",
            "\"a few VPCs, private full-bandwidth\" → VPC Peering",
            "\"across organizations\" / \"encrypted\" → HA VPN",
            "\"privately expose one service\" → Private Service Connect",
          ],
        },
      },
      {
        id: "migration-path",
        name: "Migration Path Selector",
        icon: "migration-path",
        tagline: "DMS vs M2VM vs Transfer vs Appliance",
        pairings: ["dms", "cloud-storage", "gce"],
        matrix: {
          question: "Which migration service / path fits this workload?",
          columns: [
            { key: "st", label: "Source → Target" },
            { key: "down", label: "Downtime" },
            { key: "type", label: "Type" },
            { key: "conn", label: "Connectivity needed" },
          ],
          rows: [
            {
              option: "Database Migration Service",
              cells: {
                st: "On-prem/other-cloud DB → Cloud SQL / AlloyDB / Spanner",
                down: "Near-zero (CDC)",
                type: "Homogeneous & heterogeneous",
                conn: "Private (VPC peering / PSC / reverse-SSH) or IP allowlist",
              },
              pickWhen:
                "Migrating a live relational database with minimal downtime via continuous replication.",
            },
            {
              option: "Migrate to Virtual Machines",
              cells: {
                st: "On-prem / AWS / Azure VMs → Compute Engine",
                down: "Minimal (replicate then cut over)",
                type: "Lift-and-shift servers",
                conn: "VPN / Interconnect",
              },
              pickWhen:
                "Rehosting existing servers/VMs onto Compute Engine without re-architecting them.",
            },
            {
              option: "Storage Transfer Service",
              cells: {
                st: "On-prem / other-cloud object & file data → Cloud Storage",
                down: "n/a (data copy)",
                type: "Large-scale online transfer",
                conn: "Over network (internet / VPN / Interconnect)",
              },
              pickWhen:
                "Moving large datasets online to GCS on a schedule — TB to PB over the wire when bandwidth is adequate.",
            },
            {
              option: "Transfer Appliance",
              cells: {
                st: "On-prem bulk data → Cloud Storage",
                down: "n/a",
                type: "Offline (physical shipment)",
                conn: "NONE — ship a device",
              },
              pickWhen:
                "Petabyte-scale data or poor bandwidth where an online transfer would take too long — ship a physical appliance.",
            },
            {
              option: "BigQuery Data Transfer Service",
              cells: {
                st: "SaaS / other warehouses → BigQuery",
                down: "n/a",
                type: "Scheduled analytics ingestion",
                conn: "Managed",
              },
              pickWhen:
                "Recurring, scheduled loads of data into BigQuery from SaaS apps or other clouds.",
            },
          ],
          traps: [
            "Huge data + limited bandwidth → Transfer Appliance (offline). Don't pick an online transfer that would take months.",
            "Match the tool to the object: DMS for databases (keeps them running), Storage Transfer / Transfer Appliance for object & file data, Migrate to VMs for whole servers.",
            "\"Near-zero downtime\" + relational DB → Database Migration Service (CDC), not a dump-and-restore.",
          ],
          keywords: [
            "\"minimal downtime\" + database → DMS",
            "\"rehost / lift-and-shift servers\" → Migrate to VMs",
            "\"petabytes\" / \"not enough bandwidth\" / \"offline\" → Transfer Appliance",
            "\"large online dataset to GCS\" / \"scheduled\" → Storage Transfer Service",
            "\"load into BigQuery on a schedule\" → BigQuery Data Transfer",
          ],
        },
      },
      {
        id: "dr-strategy",
        name: "DR Strategy (RTO / RPO)",
        icon: "dr-strategy",
        tagline: "Backup → pilot light → warm → hot multi-region",
        pairings: ["cloud-storage", "cloud-sql", "spanner"],
        matrix: {
          question:
            "Which disaster-recovery strategy fits the required RTO/RPO and budget?",
          columns: [
            { key: "rto", label: "RTO" },
            { key: "rpo", label: "RPO" },
            { key: "cost", label: "Cost" },
            { key: "cx", label: "Complexity" },
          ],
          rows: [
            {
              option: "Backup & Restore",
              cells: { rto: "Hours–days", rpo: "Hours (last backup)", cost: "$", cx: "Low" },
              pickWhen:
                "Non-critical workloads that tolerate longer downtime & data loss. Cheapest — restore from backups/snapshots into a new environment.",
            },
            {
              option: "Cold standby (Pilot Light)",
              cells: { rto: "10s of min–hours", rpo: "Minutes", cost: "$$", cx: "Medium" },
              pickWhen:
                "Core services pre-provisioned but scaled down/off in a second region; scale up on failover. Balances cost vs recovery time.",
            },
            {
              option: "Warm standby",
              cells: { rto: "Minutes", rpo: "Seconds–minutes", cost: "$$$", cx: "Medium–High" },
              pickWhen:
                "A scaled-down but always-running copy in a second region; scale it up on failover for faster recovery.",
            },
            {
              option: "Hot / Multi-region active-active",
              cells: { rto: "~Zero (seconds)", rpo: "~Zero", cost: "$$$$", cx: "High" },
              pickWhen:
                "Mission-critical, near-zero downtime & data loss; fully redundant and active in multiple regions (e.g. Spanner multi-region + global LB).",
            },
          ],
          traps: [
            "RTO = how fast you recover; RPO = how much data you can lose. The requirement wording picks the tier — don't jump to active-active if RTO is 'a few hours'.",
            "Multi-region active-active is the most expensive; only choose it when near-zero RTO/RPO is explicitly required.",
            "Backups alone give a poor RPO (since the last backup) — pair with frequent snapshots / PITR when RPO must be tight.",
          ],
          keywords: [
            "\"tolerate hours of downtime\" / cheapest → Backup & Restore",
            "\"scaled-down copy, scale up on failover\" → Pilot Light / Warm standby",
            "\"near-zero RTO/RPO\" / \"mission critical\" → Multi-region active-active",
            "\"RTO\" = recovery time · \"RPO\" = data-loss window",
          ],
        },
      },
      {
        id: "cost-optimization",
        name: "Cost Optimization Levers",
        icon: "cost-optimization",
        tagline: "CUD vs SUD vs Spot vs autoscaling vs tiers",
        pairings: ["gce", "cloud-storage", "bigquery"],
        matrix: {
          question: "Which cost-optimization lever applies to this workload?",
          columns: [
            { key: "mech", label: "Mechanism" },
            { key: "best", label: "Best for" },
            { key: "save", label: "Savings" },
            { key: "note", label: "Tradeoff / note" },
          ],
          rows: [
            {
              option: "Committed Use Discounts (CUD)",
              cells: { mech: "1 or 3-yr resource/spend commitment", best: "Steady, predictable baseline load", save: "up to ~57–70%", note: "Commitment risk if usage drops." },
              pickWhen: "You have a stable, predictable baseline of usage you'll keep for 1–3 years.",
            },
            {
              option: "Sustained Use Discounts (SUD)",
              cells: { mech: "Automatic for long-running VMs", best: "VMs running most of the month", save: "up to ~30%", note: "Automatic, no commitment (Compute Engine)." },
              pickWhen: "Compute Engine workloads run a large share of the month — the discount applies automatically.",
            },
            {
              option: "Spot / Preemptible VMs",
              cells: { mech: "Preemptible spare capacity", best: "Fault-tolerant, stateless batch", save: "~60–91%", note: "Reclaimable with ~30s notice." },
              pickWhen: "Batch / fault-tolerant, stateless work that can be interrupted and retried.",
            },
            {
              option: "Rightsizing & Autoscaling",
              cells: { mech: "Match capacity to demand", best: "Variable / over-provisioned workloads", save: "Varies", note: "Use recommendations + MIG/HPA; scale to zero (Cloud Run)." },
              pickWhen: "Load is variable or resources are over-provisioned — scale with demand instead of peak.",
            },
            {
              option: "Storage classes & lifecycle",
              cells: { mech: "Nearline/Coldline/Archive + rules", best: "Infrequently accessed data", save: "Large on cold data", note: "Retrieval & early-delete fees on colder tiers." },
              pickWhen: "Data is accessed rarely — auto-tier it down with lifecycle rules.",
            },
            {
              option: "BigQuery pricing model",
              cells: { mech: "On-demand vs capacity (slots)", best: "Predictable analytics spend", save: "Varies", note: "Partition/cluster + avoid SELECT * to cut bytes scanned." },
              pickWhen: "Analytics cost is high/variable — reserve slots and reduce bytes scanned.",
            },
          ],
          traps: [
            "CUDs require an explicit 1/3-yr commitment; SUDs are automatic for sustained Compute Engine usage — don't confuse them.",
            "Spot VMs can be reclaimed with ~30s notice — never use for stateful or latency-critical serving.",
            "Cold storage classes have retrieval + early-deletion costs; they're the wrong choice for frequently-read data.",
          ],
          keywords: [
            "\"steady predictable baseline\" → Committed Use Discounts",
            "\"fault-tolerant batch, cheapest compute\" → Spot / Preemptible",
            "\"infrequently accessed data\" → Nearline/Coldline/Archive + lifecycle",
            "\"variable load\" → autoscaling / rightsizing / scale-to-zero",
          ],
        },
      },
      {
        id: "ha-patterns",
        name: "HA / Deployment Scope",
        icon: "ha-patterns",
        tagline: "Zonal vs regional vs multi-region",
        pairings: ["cloud-lb", "gke", "spanner"],
        matrix: {
          question: "What deployment scope meets the availability requirement?",
          columns: [
            { key: "fail", label: "Failure it survives" },
            { key: "sla", label: "Typical SLA" },
            { key: "cost", label: "Cost" },
            { key: "ex", label: "Examples" },
          ],
          rows: [
            {
              option: "Zonal",
              cells: { fail: "Instance failure (within a zone)", sla: "Lowest", cost: "$", ex: "Single-zone VM / GKE — no zone redundancy." },
              pickWhen: "Dev/test or non-critical workloads where a zone outage is acceptable.",
            },
            {
              option: "Regional (multi-zone)",
              cells: { fail: "A zone outage", sla: "~99.9–99.99%", cost: "$$", ex: "Regional MIG, regional GKE, regional Cloud SQL HA." },
              pickWhen: "Production workloads that must survive a single-zone failure with automatic failover.",
            },
            {
              option: "Multi-region",
              cells: { fail: "A full region outage", sla: "up to 99.999%", cost: "$$$$", ex: "Global LB, Spanner multi-region, multi-region GCS/BigQuery." },
              pickWhen: "Mission-critical workloads that must survive an entire region going down.",
            },
          ],
          traps: [
            "A single-zone resource has no HA — a zone outage takes it down. Use regional for zone-fault tolerance.",
            "Only multi-region survives a full region outage, and it's the priciest — match it to the stated SLA.",
            "Regional managed services (Cloud SQL HA, regional MIG) give automatic zone failover; multi-region needs explicit design.",
          ],
          keywords: [
            "\"survive a zone failure\" → regional / multi-zone",
            "\"survive a region failure\" / 99.999% → multi-region",
            "\"single zone\" = no HA",
            "\"global single anycast IP\" → global external Application LB",
          ],
        },
      },
      {
        id: "compute-chooser",
        name: "Compute Platform Chooser",
        icon: "compute-chooser",
        tagline: "GCE vs GKE vs Cloud Run vs Functions vs App Engine",
        pairings: ["gce", "gke", "cloud-run", "cloud-functions", "app-engine"],
        matrix: {
          question: "Which compute platform fits the workload & operational model?",
          columns: [
            { key: "model", label: "Model" },
            { key: "scale", label: "Scaling" },
            { key: "best", label: "Best for" },
            { key: "note", label: "Tradeoff / note" },
          ],
          rows: [
            {
              option: "Compute Engine (GCE)",
              cells: { model: "IaaS VMs", scale: "MIG autoscaling", best: "Full OS control, licensed/legacy, GPUs, lift-and-shift", note: "You manage OS, patching & scaling config." },
              pickWhen: "You need OS-level control, specific kernels/licenses, GPUs, or a straight lift-and-shift of existing VMs.",
            },
            {
              option: "Google Kubernetes Engine (GKE)",
              cells: { model: "Managed Kubernetes", scale: "HPA / cluster autoscaler", best: "Microservices, portability, complex orchestration", note: "K8s expertise needed; Autopilot removes node ops." },
              pickWhen: "Container microservices needing fine-grained orchestration, service mesh, or multi-cloud portability.",
            },
            {
              option: "Cloud Run",
              cells: { model: "Serverless containers", scale: "Auto, scale-to-zero", best: "Stateless HTTP/event containers, APIs, web apps", note: "Request/event-driven; not for long-lived stateful daemons." },
              pickWhen: "Any stateless container you want fully managed with scale-to-zero and no cluster to run.",
            },
            {
              option: "Cloud Functions",
              cells: { model: "FaaS (functions)", scale: "Auto, per-event", best: "Event-driven glue, single-purpose triggers", note: "Short-lived; cold starts; one job per function." },
              pickWhen: "Lightweight event glue — respond to a Pub/Sub message, storage event or HTTP trigger with a small function.",
            },
            {
              option: "App Engine",
              cells: { model: "PaaS", scale: "Auto (incl. to zero, Std)", best: "Classic web/API apps, fast deploy", note: "Standard = sandboxed runtimes; Flex = containers on VMs." },
              pickWhen: "A conventional web/API app you want to deploy by code with the platform handling infrastructure.",
            },
          ],
          traps: [
            "\"Container + no infra management + scale to zero\" → Cloud Run, not GKE. Reach for GKE only when you need real Kubernetes orchestration.",
            "GPUs / specific OS / licensed software → Compute Engine; the serverless tiers can't give you kernel-level control.",
            "Cloud Functions is single-purpose & short-lived — long-running or multi-endpoint services belong on Cloud Run / GKE.",
            "GKE Autopilot vs Standard: Autopilot removes node management; use it unless you must control nodes.",
          ],
          keywords: [
            "\"full OS control / GPUs / licensed / lift-and-shift\" → Compute Engine",
            "\"container microservices / orchestration / portability\" → GKE",
            "\"stateless container, managed, scale-to-zero\" → Cloud Run",
            "\"event-driven trigger / glue\" → Cloud Functions",
            "\"deploy code, classic web app, no infra\" → App Engine",
          ],
        },
      },
      {
        id: "lb-chooser",
        name: "Load Balancer Chooser",
        icon: "lb-chooser",
        tagline: "Global vs regional · L7 vs L4 · external vs internal",
        pairings: ["cloud-lb", "cloud-cdn", "cloud-armor"],
        matrix: {
          question: "Which Cloud Load Balancer fits the traffic type & scope?",
          columns: [
            { key: "layer", label: "Layer" },
            { key: "scope", label: "Scope" },
            { key: "use", label: "Use for" },
            { key: "note", label: "Note" },
          ],
          rows: [
            {
              option: "Global external Application LB",
              cells: { layer: "L7 (HTTP/S)", scope: "Global anycast", use: "Internet-facing web/API across regions", note: "Single anycast IP; works with Cloud CDN & Cloud Armor." },
              pickWhen: "Internet-facing HTTP(S) with users worldwide — one global IP, cross-region routing, CDN and WAF.",
            },
            {
              option: "Regional external Application LB",
              cells: { layer: "L7 (HTTP/S)", scope: "Single region", use: "Regional web/API, data-residency", note: "Region-scoped; use when traffic must stay in one region." },
              pickWhen: "Internet-facing HTTP(S) that must stay within a single region (e.g. regulatory data residency).",
            },
            {
              option: "External passthrough Network LB",
              cells: { layer: "L4 (TCP/UDP)", scope: "Regional", use: "Non-HTTP TCP/UDP, preserve client IP", note: "Passthrough (no proxy); original source IP preserved." },
              pickWhen: "L4 TCP/UDP internet traffic, or when you must preserve the original client source IP.",
            },
            {
              option: "Internal Application LB",
              cells: { layer: "L7 (HTTP/S)", scope: "Regional (internal)", use: "Internal microservice HTTP routing", note: "Private VIP inside the VPC; path/host routing." },
              pickWhen: "HTTP(S) routing between internal microservices/tiers on a private address inside your VPC.",
            },
            {
              option: "Internal passthrough Network LB",
              cells: { layer: "L4 (TCP/UDP)", scope: "Regional (internal)", use: "Internal TCP/UDP, next-hop for appliances", note: "Private VIP; can be a route next-hop (e.g. NVA/firewall)." },
              pickWhen: "Internal L4 TCP/UDP traffic, or as a next-hop VIP for HA network virtual appliances.",
            },
          ],
          traps: [
            "Two axes pick the LB: internet-facing vs internal, and L7 HTTP(S) vs L4 TCP/UDP. Nail both before choosing.",
            "Cloud CDN and Cloud Armor attach to the (global) external Application LB — if the question mentions edge caching or WAF, that's the L7 Application LB.",
            "\"Preserve client source IP\" / non-HTTP protocol → passthrough Network LB, not an Application (proxy) LB.",
            "Global anycast single IP + multi-region backends → global external Application LB.",
          ],
          keywords: [
            "\"global users, one IP, HTTP(S), CDN/WAF\" → Global external Application LB",
            "\"internal HTTP microservices\" → Internal Application LB",
            "\"TCP/UDP, preserve source IP\" → passthrough Network LB",
            "\"next-hop for NVA / firewall appliance\" → Internal passthrough Network LB",
            "\"data must stay in region\" → Regional external Application LB",
          ],
        },
      },
      {
        id: "data-processing-chooser",
        name: "Data Processing Chooser",
        icon: "data-processing-chooser",
        tagline: "Dataflow vs Dataproc vs Data Fusion vs Composer vs BigQuery",
        pairings: ["dataflow", "dataproc", "datafusion", "composer", "bigquery"],
        matrix: {
          question: "Which data-processing or pipeline service fits the job?",
          columns: [
            { key: "type", label: "Type" },
            { key: "best", label: "Best for" },
            { key: "note", label: "Tradeoff / note" },
          ],
          rows: [
            {
              option: "Dataflow",
              cells: { type: "Serverless Beam (batch + stream)", best: "New streaming/ETL pipelines, real-time", note: "Unified batch/stream, no cluster; handles windowing & late data." },
              pickWhen: "Greenfield streaming or batch ETL where you want serverless and one model for both.",
            },
            {
              option: "Dataproc",
              cells: { type: "Managed Spark / Hadoop", best: "Lift-and-shift existing OSS big-data jobs", note: "Reuse Spark/Hadoop code & skills; use ephemeral clusters + GCS." },
              pickWhen: "You already have Spark/Hadoop/Hive code and want to migrate it with minimal rewrite.",
            },
            {
              option: "Cloud Data Fusion",
              cells: { type: "Code-free visual ETL/ELT", best: "GUI pipeline building, 150+ connectors", note: "Runs on ephemeral Dataproc; good for analysts, built-in lineage." },
              pickWhen: "Teams want drag-and-drop pipelines with many connectors and no code.",
            },
            {
              option: "Cloud Composer",
              cells: { type: "Managed Airflow orchestration", best: "Multi-step dependency scheduling across services", note: "Orchestrates (retries/backfills); doesn't do the heavy crunching itself." },
              pickWhen: "You must orchestrate a dependency graph of jobs across services with scheduling & retries.",
            },
            {
              option: "BigQuery (SQL / Dataform)",
              cells: { type: "In-warehouse SQL ELT", best: "Transform data already in BigQuery", note: "Cheapest when data's in BQ; scheduled queries / Dataform for pipelines." },
              pickWhen: "The data already lives in BigQuery and the transform can be expressed in SQL.",
            },
          ],
          traps: [
            "Existing Spark/Hadoop → Dataproc; greenfield serverless streaming → Dataflow. The word 'existing/migrate' vs 'new' usually decides it.",
            "Composer orchestrates pipelines; it does not process the data — Dataflow/Dataproc/BigQuery do the crunching.",
            "\"Code-free / visual / analysts\" → Data Fusion; \"unified batch + stream / Beam\" → Dataflow.",
            "If data is already in BigQuery and it's just SQL, don't spin up Dataflow — use scheduled queries / Dataform.",
          ],
          keywords: [
            "\"new serverless streaming, windowing, Beam\" → Dataflow",
            "\"existing Spark/Hadoop, lift-and-shift\" → Dataproc",
            "\"code-free visual ETL, connectors\" → Data Fusion",
            "\"orchestrate multi-step DAG, retries/backfills\" → Cloud Composer",
            "\"data already in BigQuery, SQL transform\" → BigQuery / Dataform",
          ],
        },
      },
      {
        id: "storage-chooser",
        name: "Storage & Database Chooser",
        icon: "storage-chooser",
        tagline: "Object · relational · global · document · wide-column · analytics · cache",
        pairings: ["cloud-storage", "cloud-sql", "spanner", "firestore", "bigtable", "bigquery", "memorystore"],
        matrix: {
          question: "Which storage or database fits the data shape & access pattern?",
          columns: [
            { key: "model", label: "Data model" },
            { key: "best", label: "Best for" },
            { key: "note", label: "Key signal / note" },
          ],
          rows: [
            {
              option: "Cloud Storage",
              cells: { model: "Object / blob", best: "Unstructured files, backups, data lake, static assets", note: "Not a database — no queries; tier with storage classes." },
              pickWhen: "Unstructured objects (images, video, files, backups) or a data-lake landing zone.",
            },
            {
              option: "Cloud SQL",
              cells: { model: "Relational (OLTP)", best: "Regional MySQL/PostgreSQL/SQL Server apps", note: "Managed, regional; vertical scale + read replicas. Default OLTP." },
              pickWhen: "A traditional relational transactional app that fits within a region.",
            },
            {
              option: "Spanner",
              cells: { model: "Relational, globally distributed", best: "Global scale + strong consistency, high availability", note: "Horizontal scale & 99.999% multi-region; pricier — only when you need global." },
              pickWhen: "Relational data needing horizontal scale, global reach and strong consistency beyond one region.",
            },
            {
              option: "Firestore",
              cells: { model: "Document NoSQL", best: "Mobile/web apps, real-time sync, serverless", note: "Serverless, offline sync & live listeners; not for heavy analytics." },
              pickWhen: "Semi-structured document data for mobile/web with real-time sync and simple scaling.",
            },
            {
              option: "Bigtable",
              cells: { model: "Wide-column NoSQL", best: "High-throughput time-series, IoT, ad-tech at huge scale", note: "Millisecond latency, petabyte scale; single-key/range access, no SQL joins." },
              pickWhen: "Massive-write, low-latency key/time-series workloads (IoT, telemetry, ad-tech, monitoring).",
            },
            {
              option: "BigQuery",
              cells: { model: "Analytics warehouse (OLAP)", best: "SQL analytics, BI, ML on large datasets", note: "Serverless columnar; analytics not OLTP — don't use for transactional point-writes." },
              pickWhen: "Analytical SQL / BI / reporting over large datasets (not transactional workloads).",
            },
            {
              option: "Memorystore",
              cells: { model: "In-memory cache", best: "Sub-ms caching, sessions, leaderboards", note: "Redis/Memcached; volatile — a cache in front of a database, not the source of truth." },
              pickWhen: "You need a sub-millisecond cache or session store in front of a primary database.",
            },
          ],
          traps: [
            "Relational + fits one region → Cloud SQL; relational + global/horizontal scale + strong consistency → Spanner (only when you truly need global — it's costly).",
            "Analytics (OLAP) → BigQuery; transactional point reads/writes (OLTP) → Cloud SQL/Spanner. Never use BigQuery as an OLTP store.",
            "High-throughput NoSQL at massive scale / time-series → Bigtable; app-facing document data with real-time sync → Firestore. Don't confuse the two NoSQL options.",
            "Cloud Storage is object storage, not a queryable database — if the question needs queries/indexes, it's the wrong answer.",
          ],
          keywords: [
            "\"unstructured files / backups / data lake\" → Cloud Storage",
            "\"regional relational OLTP (MySQL/Postgres)\" → Cloud SQL",
            "\"global, horizontally-scalable, strongly-consistent relational\" → Spanner",
            "\"mobile/web app, real-time sync, document\" → Firestore",
            "\"time-series / IoT / huge write throughput, low latency\" → Bigtable",
            "\"data warehouse, SQL analytics/BI\" → BigQuery",
            "\"sub-ms cache / session store\" → Memorystore",
          ],
        },
      },
      {
        id: "compliance-mapping",
        name: "Compliance & Regulation Mapping",
        icon: "compliance-mapping",
        tagline: "Requirement → the GCP control that satisfies it",
        pairings: ["vpc-sc", "cloud-kms", "iam", "cloud-logging"],
        matrix: {
          question: "Which GCP control satisfies this compliance / regulatory requirement?",
          columns: [
            { key: "need", label: "Requirement" },
            { key: "how", label: "How it's met" },
            { key: "note", label: "Watch out" },
          ],
          rows: [
            {
              option: "Resource Location org policy + Assured Workloads",
              cells: {
                need: "Data residency / sovereignty",
                how: "Constrain resource locations org-wide; Assured Workloads enforces packaged regimes (FedRAMP, IL4/5, CJIS, HIPAA, EU sovereignty) with personnel & support controls",
                note: "Generic 'keep data in region' → location org policy; a named regime → Assured Workloads.",
              },
              pickWhen:
                "Data must stay in a jurisdiction, or you need a named regulatory package with support/personnel controls.",
            },
            {
              option: "VPC Service Controls",
              cells: {
                need: "Prevent data exfiltration (perimeter)",
                how: "Service perimeter around managed services (GCS, BigQuery, etc.) so data can't move to projects/networks outside the boundary",
                note: "Stops trusted-but-compromised identities exfiltrating data; complements IAM, doesn't replace it.",
              },
              pickWhen:
                "Sensitive data in managed services must not leave a defined boundary even if credentials leak.",
            },
            {
              option: "Cloud KMS — CMEK / CSEK (+ Confidential Computing)",
              cells: {
                need: "Customer-controlled encryption",
                how: "All data encrypted at rest by default; CMEK to own key lifecycle/rotation, CSEK to supply your own; Confidential Computing encrypts data in-use",
                note: "Default encryption is always on — CMEK is about controlling the KEYS, not adding encryption.",
              },
              pickWhen:
                "Regulation requires you to control/rotate encryption keys, or to keep data encrypted while processed.",
            },
            {
              option: "Sensitive Data Protection (Cloud DLP)",
              cells: {
                need: "Discover & de-identify PII / PHI / PCI",
                how: "Scan & classify sensitive data across storage and streams; mask, tokenize or redact it",
                note: "De-identify before sending data to logs, analytics or AI models.",
              },
              pickWhen:
                "You must find, classify or redact sensitive data (PII/PHI/PAN) to meet privacy rules.",
            },
            {
              option: "Cloud Audit Logs",
              cells: {
                need: "Auditability / accountability",
                how: "Admin Activity logs always on; enable Data Access logs for a record of who read/wrote what",
                note: "Data Access logs are OFF by default (except BigQuery) — enable them or the audit trail is incomplete.",
              },
              pickWhen:
                "You must prove who accessed or changed data/config for an audit.",
            },
            {
              option: "Access Transparency + Access Approval",
              cells: {
                need: "Oversight of Google-support access",
                how: "Access Transparency logs Google personnel access to your data; Access Approval requires your explicit approval first",
                note: "For regimes demanding control/visibility over the cloud provider touching your data.",
              },
              pickWhen:
                "You must see and/or approve any Google support/engineer access to your data.",
            },
            {
              option: "IAM + Policy Intelligence / Security Command Center",
              cells: {
                need: "Least privilege & compliance posture",
                how: "Least-privilege roles + Recommender to trim excess access; SCC surfaces misconfig, findings & compliance dashboards (CIS/PCI/etc.)",
                note: "SCC Premium maps findings to benchmarks; Recommender enforces least privilege continuously.",
              },
              pickWhen:
                "You must enforce least privilege and continuously monitor compliance posture & misconfigurations.",
            },
          ],
          traps: [
            "Data Access audit logs are disabled by default (except BigQuery) — turn them on, or you won't have the records an audit needs.",
            "CMEK doesn't add encryption (data is already encrypted at rest) — it gives YOU control of the key lifecycle. Don't cite CMEK when the need is merely 'encrypted at rest'.",
            "VPC Service Controls stops exfiltration by trusted-but-compromised identities; IAM controls who has access. Compliance usually needs both, not one.",
            "A named regime (FedRAMP, CJIS, IL4/5, HIPAA, EU sovereignty) → Assured Workloads; a generic 'keep data in region' → Resource Location org policy.",
          ],
          keywords: [
            "\"data must stay in region/country\" → Resource Location org policy",
            "\"FedRAMP / CJIS / IL4 / sovereign controls\" → Assured Workloads",
            "\"prevent data exfiltration\" / \"perimeter\" → VPC Service Controls",
            "\"we must own / rotate the keys\" → Cloud KMS (CMEK)",
            "\"find / redact PII / PHI\" → Sensitive Data Protection (DLP)",
            "\"who accessed the data\" / audit trail → Cloud Audit Logs (enable Data Access)",
            "\"approve Google support access\" → Access Approval / Access Transparency",
          ],
        },
      },
    ],
  },
];

// Flat lookup used by search, pairing highlights and the detail panel.
export interface FlatService extends Service {
  pillarId: string;
  pillarName: string;
  accent: string;
}

export const SERVICE_INDEX: Record<string, FlatService> = Object.fromEntries(
  CURRICULUM.flatMap((pillar) =>
    pillar.services.map((service) => [
      service.id,
      {
        ...service,
        pillarId: pillar.id,
        pillarName: pillar.name,
        accent: pillar.accent,
      },
    ]),
  ),
);
