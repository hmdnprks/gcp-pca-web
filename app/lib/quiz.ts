// Scenario-style decision questions for the quiz mode.
// Each question links to a service/guide id so answering updates the
// confidence heatmap and offers a "review this topic" jump.

export interface QuizQuestion {
  id: string;
  /** Pillar-ish grouping used for the "quiz by domain" scope. */
  domain: string;
  /** The scenario prompt. */
  prompt: string;
  options: string[];
  /** Index into `options` of the correct answer. */
  answerIndex: number;
  explanation: string;
  /** id in SERVICE_INDEX to link confidence + review to. */
  serviceId: string;
}

export const QUIZ: QuizQuestion[] = [
  // ── Networking / connectivity ────────────────────────────────────────────
  {
    id: "q-conn-dedicated",
    domain: "Networking",
    prompt:
      "A retailer needs to connect its on-prem datacenter to a Google VPC with a private, consistent 10 Gbps link at the lowest possible latency. They already have equipment in a Google colocation facility. Which option?",
    options: [
      "Dedicated Interconnect",
      "HA VPN",
      "Partner Interconnect",
      "Direct Peering",
    ],
    answerIndex: 0,
    explanation:
      "Dedicated Interconnect gives private, high, consistent bandwidth (10/100 Gbps) and the lowest latency when you can meet Google in a colocation facility. VPN is encrypted but lower bandwidth; Partner Interconnect is for when you have no colo presence; Direct Peering only reaches Google public APIs, not the VPC.",
    serviceId: "hybrid-connectivity",
  },
  {
    id: "q-conn-vpn",
    domain: "Networking",
    prompt:
      "A startup needs an encrypted connection from on-prem to their VPC, stood up within a day, with only modest bandwidth needs. Best fit?",
    options: ["HA VPN", "Dedicated Interconnect", "Partner Interconnect", "Cloud CDN"],
    answerIndex: 0,
    explanation:
      "HA VPN provides encrypted (IPsec) connectivity over the internet, deploys in hours, and offers a 99.99% SLA — ideal for quick, moderate-bandwidth needs. Interconnect options take days to weeks and are private but not encrypted by default.",
    serviceId: "hybrid-connectivity",
  },
  {
    id: "q-conn-peering-trap",
    domain: "Networking",
    prompt:
      "An architect wants private RFC1918 connectivity from on-prem to VMs in their VPC and proposes Direct Peering. What's the flaw?",
    options: [
      "Direct Peering only reaches Google/Workspace public APIs, not private VPC (RFC1918) traffic",
      "Direct Peering has no SLA, but is otherwise correct",
      "Direct Peering requires you to enable encryption first",
      "Nothing — it's the best option here",
    ],
    answerIndex: 0,
    explanation:
      "Peering (Direct/Carrier) is only for reaching Google's public APIs and services — it does NOT provide private RFC1918 access to your VPC. For on-prem ↔ VPC private traffic use VPN or Interconnect. This is a classic exam trap.",
    serviceId: "hybrid-connectivity",
  },
  {
    id: "q-conn-ncc",
    domain: "Networking",
    prompt:
      "You must connect 12 VPCs across multiple projects with transitive routing through a central hub. Best fit?",
    options: [
      "Network Connectivity Center",
      "VPC Peering mesh",
      "Shared VPC",
      "A full mesh of Cloud VPN tunnels",
    ],
    answerIndex: 0,
    explanation:
      "Network Connectivity Center provides transitive hub-and-spoke connectivity for many VPCs (and hybrid links). VPC Peering is non-transitive and doesn't scale to a full mesh; Shared VPC is a single network within one org.",
    serviceId: "vpc-connectivity",
  },
  {
    id: "q-conn-peering-transitive",
    domain: "Networking",
    prompt:
      "A team peered VPC-A↔VPC-B and VPC-B↔VPC-C. VPC-A cannot reach VPC-C. Why?",
    options: [
      "VPC Peering is non-transitive",
      "Overlapping CIDR ranges block it",
      "A default-deny firewall rule",
      "Peering requires a VPN underneath",
    ],
    answerIndex: 0,
    explanation:
      "VPC Peering is non-transitive: traffic can't hop A→B→C through an intermediate peer. Use Network Connectivity Center for transitive hub-and-spoke connectivity.",
    serviceId: "vpc-connectivity",
  },

  // ── Migration ─────────────────────────────────────────────────────────────
  {
    id: "q-mig-dms",
    domain: "Migration",
    prompt:
      "A bank must migrate a live 2 TB PostgreSQL database to Cloud SQL with near-zero downtime. Which service?",
    options: [
      "Database Migration Service",
      "Transfer Appliance",
      "Storage Transfer Service",
      "BigQuery Data Transfer Service",
    ],
    answerIndex: 0,
    explanation:
      "Database Migration Service uses continuous replication (CDC) to keep the target in sync and cut over with minimal downtime — the right tool for a live relational DB. The transfer services move object/file/analytics data, not running databases.",
    serviceId: "migration-path",
  },
  {
    id: "q-mig-appliance",
    domain: "Migration",
    prompt:
      "A media company needs to move 800 TB of archival files to Cloud Storage, but their internet uplink would take months. Best approach?",
    options: [
      "Transfer Appliance",
      "Storage Transfer Service over the internet",
      "gsutil over an HA VPN",
      "Dedicated Interconnect, then upload",
    ],
    answerIndex: 0,
    explanation:
      "When data is huge and bandwidth is the bottleneck, Transfer Appliance ships a physical device (offline) — far faster than any online transfer. Online transfer services are right only when the network can move the data in reasonable time.",
    serviceId: "migration-path",
  },

  // ── Storage & Databases ────────────────────────────────────────────────────
  {
    id: "q-db-spanner",
    domain: "Storage & Databases",
    prompt:
      "An app needs a globally-distributed relational database with strong consistency and horizontal write scaling for a worldwide user base. Which?",
    options: ["Cloud Spanner", "Cloud SQL", "Cloud Bigtable", "Firestore"],
    answerIndex: 0,
    explanation:
      "Cloud Spanner is the only option combining relational + ACID + global strong consistency + horizontal write scaling (up to 99.999%). Cloud SQL can't scale writes horizontally or span regions with strong consistency.",
    serviceId: "spanner",
  },
  {
    id: "q-db-bigtable",
    domain: "Storage & Databases",
    prompt:
      "You must store IoT time-series data at massive scale with sub-10 ms lookups keyed by device + timestamp. Which database?",
    options: ["Cloud Bigtable", "BigQuery", "Cloud SQL", "Cloud Spanner"],
    answerIndex: 0,
    explanation:
      "Bigtable is a wide-column NoSQL store built for high-throughput, low-latency (sub-10 ms) time-series/IoT workloads with a single row-key index — a perfect fit for device+timestamp keys.",
    serviceId: "bigtable",
  },
  {
    id: "q-db-bigquery",
    domain: "Storage & Databases",
    prompt:
      "An analyst needs large ad-hoc SQL analytics over petabytes of historical data. A colleague suggests Bigtable. Better choice?",
    options: ["BigQuery", "Bigtable", "Memorystore", "Cloud SQL"],
    answerIndex: 0,
    explanation:
      "BigQuery is the serverless OLAP warehouse for ad-hoc SQL analytics over petabytes. Bigtable is for high-QPS operational access, not analytical SQL scans/joins.",
    serviceId: "bigquery",
  },

  // ── Compute ────────────────────────────────────────────────────────────────
  {
    id: "q-comp-cloudrun",
    domain: "Compute",
    prompt:
      "A team wants to run a stateless HTTP API in containers, scale to zero when idle, and avoid managing any cluster. Which platform?",
    options: [
      "Cloud Run",
      "GKE Standard",
      "Compute Engine MIG",
      "App Engine Flexible",
    ],
    answerIndex: 0,
    explanation:
      "Cloud Run runs stateless containers, scales to zero, is pay-per-use, and has no cluster to manage — ideal for HTTP APIs/microservices. GKE adds cluster overhead; MIGs are always-on VMs.",
    serviceId: "cloud-run",
  },
  {
    id: "q-comp-gke",
    domain: "Compute",
    prompt:
      "A workload requires DaemonSets, a service mesh, and fine-grained control over the Kubernetes API. Which platform?",
    options: ["GKE", "Cloud Run", "Cloud Run functions", "App Engine Standard"],
    answerIndex: 0,
    explanation:
      "When you need the full Kubernetes API (DaemonSets, StatefulSets, service mesh, custom controllers), GKE is the fit. Cloud Run intentionally abstracts the cluster away and can't express those primitives.",
    serviceId: "gke",
  },

  // ── Security ───────────────────────────────────────────────────────────────
  {
    id: "q-sec-iap",
    domain: "Security",
    prompt:
      "Employees must access internal web apps based on user identity and device context, without a VPN (zero-trust). Which service?",
    options: [
      "Identity-Aware Proxy (IAP)",
      "Cloud Armor",
      "Cloud VPN",
      "VPC Service Controls",
    ],
    answerIndex: 0,
    explanation:
      "IAP enforces context-aware, per-request access based on identity + device context (BeyondCorp / zero-trust) — no VPN required. Cloud Armor is a WAF/DDoS edge; VPC-SC is an exfiltration perimeter.",
    serviceId: "cloud-iap",
  },
  {
    id: "q-sec-vpcsc",
    domain: "Security",
    prompt:
      "To prevent data exfiltration from BigQuery and Cloud Storage even if valid credentials are stolen, what do you add?",
    options: [
      "VPC Service Controls",
      "Tighter Cloud IAM roles",
      "Cloud KMS (CMEK)",
      "Secret Manager",
    ],
    answerIndex: 0,
    explanation:
      "VPC Service Controls draws a perimeter around managed services so data can't leave — even for identities with valid IAM. IAM controls who can access; VPC-SC controls from where and whether data can exit.",
    serviceId: "vpc-sc",
  },
  {
    id: "q-sec-armor",
    domain: "Security",
    prompt:
      "Your public web app behind an external HTTP(S) load balancer is hit by L7 DDoS and SQL-injection attempts. Which service mitigates this at the edge?",
    options: [
      "Cloud Armor",
      "Identity-Aware Proxy",
      "Cloud NAT",
      "Cloud CDN",
    ],
    answerIndex: 0,
    explanation:
      "Cloud Armor is the edge WAF/DDoS layer on the external Application LB, with preconfigured OWASP rules (SQLi/XSS) and rate limiting. IAP handles authenticated access, not volumetric/L7 attack filtering.",
    serviceId: "cloud-armor",
  },

  // ── Data & AI ──────────────────────────────────────────────────────────────
  {
    id: "q-data-dataflow",
    domain: "Data & AI",
    prompt:
      "You need to ingest streaming events and run real-time transformations into BigQuery, fully serverless and autoscaling. Which pipeline?",
    options: [
      "Pub/Sub → Dataflow → BigQuery",
      "Pub/Sub → Dataproc → Bigtable",
      "Cloud Composer → BigQuery",
      "Storage Transfer Service → BigQuery",
    ],
    answerIndex: 0,
    explanation:
      "Pub/Sub ingests the stream, Dataflow (serverless Apache Beam) does autoscaling stream processing with windowing/watermarks, and BigQuery is the analytics sink — the canonical GCP streaming pipeline. Dataproc is for existing Spark/Hadoop; Composer orchestrates, it doesn't process.",
    serviceId: "dataflow",
  },
];
