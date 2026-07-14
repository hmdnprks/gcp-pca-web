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
        tagline: "Unified ML platform",
        detail: {
          design: [
            "Unified ML platform covering the full lifecycle: data → training (AutoML or custom) → Model Registry → deployment (endpoints) → monitoring. Also Vertex AI for generative AI (Gemini, Model Garden).",
            "Includes Feature Store, Pipelines (Kubeflow/TFX) & Workbench notebooks; batch & online prediction. AutoML for speed, custom training for control.",
          ],
          security: [
            "IAM; CMEK; VPC Service Controls & private endpoints; model & data governance.",
          ],
          operations: [
            "Managed endpoints with autoscaling; Model Monitoring detects training/serving skew & drift; Pipelines give reproducible MLOps.",
          ],
          keywords: [
            "\"unified ML platform / MLOps\"",
            "\"AutoML vs custom training\"",
            "\"Feature Store / Pipelines / Model Registry\"",
            "\"online vs batch prediction\"",
            "\"model monitoring (skew / drift)\"",
            "\"Gemini / Model Garden\"",
          ],
          antipatterns: [
            "Simple SQL-based predictions → BigQuery ML may be simpler.",
            "Non-ML data transforms → Dataflow.",
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
