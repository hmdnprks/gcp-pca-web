// Scenario-style decision questions for the quiz mode.
// Each question links to a service/guide id so answering updates the
// confidence heatmap and offers a "review this topic" jump.

export interface QuizQuestion {
  id: string;
  /** Pillar-ish grouping used for the "quiz by domain" scope + card badge. */
  domain: string;
  /** Official PCA exam-guide section (drives the "by exam section" scope). */
  section?: string;
  /** Official case-study id (altostrat | cymbal | ehr | knightmotives). */
  caseStudy?: string;
  /** True for questions lifted from the official Google PCA training decks. */
  official?: boolean;
  /** The scenario prompt. */
  prompt: string;
  options: string[];
  /**
   * Index into `options` of the correct answer. An array marks a
   * multi-answer ("choose two") question.
   */
  answerIndex: number | number[];
  explanation: string;
  /** id in SERVICE_INDEX to link confidence + review to (optional). */
  serviceId?: string;
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

  // ══════════════════════════════════════════════════════════════════════
  // Official diagnostic questions — extracted verbatim from the Google
  // "Preparing for your PCA" training decks (Modules 1–6). Grouped by exam
  // section + case study. answerIndex verified against each deck's answer
  // slide (gold-highlight / green-text key).
  // ══════════════════════════════════════════════════════════════════════
  {
    id: "off-w2-sec1-q1",
    domain: "Data & AI",
    section: "1 · Designing & planning",
    official: true,
    prompt:
      "Cymbal Direct drones continuously send data during deliveries. You need to process and analyze the incoming telemetry data. After processing, the data should be retained, but it will only be accessed once every month or two. Your CIO has issued a directive to incorporate managed services wherever possible. You want a cost-effective solution to process the incoming streams of data.",
    options: [
      "Ingest data with IoT Core, process it with Dataprep, and store it in a Coldline Cloud Storage bucket",
      "Ingest data with IoT Core, and then publish to Pub/Sub. Use Dataflow to process the data, and store it in a Nearline Cloud Storage bucket",
      "Ingest data with IoT Core, and then publish to Pub/Sub. Use BigQuery to process the data, and store it in a Standard Cloud Storage bucket",
      "Ingest data with IoT Core, and then store it in BigQuery",
    ],
    answerIndex: 1,
    explanation:
      "Official answer: B. Ingest data with IoT Core, and then publish to Pub/Sub. Use Dataflow to process the data, and store it in a Nearline Cloud Storage bucket",
    serviceId: "dataflow",
  },
  {
    id: "off-w2-sec1-q2",
    domain: "General",
    section: "1 · Designing & planning",
    official: true,
    prompt:
      "Customers need to have a good experience when accessing your web application so they will continue to use your service. You want to define key performance indicators (KPIs) to establish a service level objective (SLO). Which KPI could you use?",
    options: [
      "Eighty-five percent of customers are satisfied users",
      "Eighty-five percent of requests succeed when aggregated over 1 minute",
      "Low latency for > 85% of requests when aggregated over 1 minute",
      "Eighty-five percent of requests are successful",
    ],
    answerIndex: 1,
    explanation:
      "Official answer: B. Eighty-five percent of requests succeed when aggregated over 1 minute",
  },
  {
    id: "off-w2-sec1-q3",
    domain: "Compute",
    section: "1 · Designing & planning",
    official: true,
    prompt:
      "Cymbal Direct developers have written a new application. Based on initial usage estimates, you decide to run the application on Compute Engine instances with 15 Gb of RAM and 4 CPUs. These instances store persistent data locally. After the application runs for several months, historical data indicates that the application requires 30 Gb of RAM. Cymbal Direct management wants you to make adjustments that will minimize costs.",
    options: [
      "Stop the instance, and then use the command gcloud compute instances set-machine-type VM_NAME --machine-type e2-standard-8. Start the instance again",
      "Stop the instance, and then use the command gcloud compute instances set-machine-type VM_NAME --machine-type e2-standard-8. Set the instance’s metadata to: preemptible: true. Start the instance again",
      "Stop the instance, and then use the command gcloud compute instances set-machine-type VM_NAME --machine-type 2-custom-4-30720. Start the instance again",
      "Stop the instance, and then use the command gcloud compute instances set-machine-type VM_NAME --machine-type 2-custom-4-30720. Set the instance’s metadata to: preemptible: true. Start the instance again",
    ],
    answerIndex: 2,
    explanation:
      "Official answer: C. Stop the instance, and then use the command gcloud compute instances set-machine-type VM_NAME --machine-type 2-custom-4-30720. Start the instance again",
    serviceId: "gce",
  },
  {
    id: "off-w2-sec1-q4",
    domain: "Networking",
    section: "1 · Designing & planning",
    official: true,
    prompt:
      "You are creating a new project. You plan to set up a Dedicated interconnect between two of your data centers in the near future and want to ensure that your resources are only deployed to the same regions where your data centers are located. You need to make sure that you don’t have any overlapping IP addresses that could cause conflicts when you set up the interconnect. You want to use RFC 1918 class B address space.",
    options: [
      "Create a new project, leave the default network in place, and then use the default 10.x.x.x network range to create subnets in your desired regions",
      "Create a new project, delete the default VPC network, set up an auto mode VPC network, and then use the default 10.x.x.x network range to create subnets in your desired regions",
      "Create a new project, delete the default VPC network, set up a custom mode VPC network, and then use IP addresses in the 172.16.x.x address range to create subnets in your desired regions",
      "Create a new project, delete the default VPC network, set up the network in custom mode, and then use IP addresses in the 192.168.x.x address range to create subnets in your desired zones. Use VPC Network Peering to connect the zones in the same region to create regional networks",
    ],
    answerIndex: 2,
    explanation:
      "Official answer: C. Create a new project, delete the default VPC network, set up a custom mode VPC network, and then use IP addresses in the 172.16.x.x address range to create subnets in your desired regions",
    serviceId: "cloud-interconnect",
  },
  {
    id: "off-w2-sec1-q5",
    domain: "Networking",
    section: "1 · Designing & planning",
    official: true,
    prompt:
      "Cymbal Direct is working with Cymbal Retail, a separate, autonomous division of Cymbal with different staff, networking teams, and data center. Cymbal Direct and Cymbal Retail are not in the same Google Cloud organization. Cymbal Retail needs access to Cymbal Direct’s web application for making bulk orders, but the application will not be available on the public internet. You want to ensure that Cymbal Retail has access to your application with low latency. You also want to avoid egress network charges if possible.",
    options: [
      "Verify that the subnet range Cymbal Retail is using doesn’t overlap with Cymbal Direct’s subnet range, and then enable VPC Network Peering for the project",
      "If Cymbal Retail does not have access to a Google Cloud data center, use Carrier Peering to connect the two networks",
      "Specify Cymbal Direct’s project as the Shared VPC host project, and then configure Cymbal Retail’s project as a service project",
      "Verify that the subnet Cymbal Retail is using has the same IP address range with Cymbal Direct’s subnet range, and then enable VPC Network Peering for the project",
    ],
    answerIndex: 0,
    explanation:
      "Official answer: A. Verify that the subnet range Cymbal Retail is using doesn’t overlap with Cymbal Direct’s subnet range, and then enable VPC Network Peering for the project",
    serviceId: "hybrid-connectivity",
  },
  {
    id: "off-w2-sec1-q6",
    domain: "Networking",
    section: "1 · Designing & planning",
    official: true,
    prompt:
      "Cymbal Direct's employees will use Google Workspace. Your current on-premises network cannot meet the requirements to connect to Google's public infrastructure.",
    options: [
      "Order a Dedicated Interconnect from a Google Cloud partner, and ensure that proper routes are configured",
      "Connect the network to a Google point of presence, and enable Direct Peering",
      "Order a Partner Interconnect from a Google Cloud partner, and ensure that proper routes are configured",
      "Connect the on-premises network to Google’s public infrastructure via a partner that supports Carrier Peering",
    ],
    answerIndex: 3,
    explanation:
      "Official answer: D. Connect the on-premises network to Google’s public infrastructure via a partner that supports Carrier Peering",
    serviceId: "cloud-interconnect",
  },
  {
    id: "off-w2-sec1-q7",
    domain: "Data & AI",
    section: "1 · Designing & planning",
    official: true,
    prompt:
      "Cymbal Direct is evaluating database options to store the analytics data from its experimental drone deliveries. You're currently using a small cluster of MongoDB NoSQL database servers. You want to move to a managed NoSQL database service with consistent low latency that can scale throughput seamlessly and can handle the petabytes of data you expect after expanding to additional markets.",
    options: [
      "Extract the data from MongoDB. Insert the data into Firestore using Datastore mode",
      "Create a Bigtable instance, extract the data from MongoDB, and insert the data into Bigtable",
      "Extract the data from MongoDB. Insert the data into Firestore using Native mode",
      "Extract the data from MongoDB, and insert the data into BigQuery",
    ],
    answerIndex: 1,
    explanation:
      "Official answer: B. Create a Bigtable instance, extract the data from MongoDB, and insert the data into Bigtable",
    serviceId: "bigquery",
  },
  {
    id: "off-w2-sec1-q8",
    domain: "Compute",
    section: "1 · Designing & planning",
    official: true,
    prompt:
      "You are working with a client who is using Google Kubernetes Engine (GKE) to migrate applications from a virtual machine–based environment to a microservices-based architecture. Your client has a complex legacy application that stores a significant amount of data on the file system of its VM. You do not want to re-write the application to use an external service to store the file system data.",
    options: [
      "In Cloud Shell, create a YAML file defining your Deployment called deployment.yaml. Create a Deployment in GKE by running the command kubectl apply -f deployment.yaml",
      "In Cloud Shell, create a YAML file defining your Container called build.yaml. Create a Container in GKE by running the command gcloud builds submit –config build.yaml",
      "In Cloud Shell, create a YAML file defining your StatefulSet called statefulset.yaml. Create a StatefulSet in GKE by running the command kubectl apply -f statefulset.yaml",
      "In Cloud Shell, create a YAML file defining your Pod called pod.yaml. Create a Pod in GKE by running the command kubectl apply -f pod.yaml",
    ],
    answerIndex: 2,
    explanation:
      "Official answer: C. In Cloud Shell, create a YAML file defining your StatefulSet called statefulset.yaml. Create a StatefulSet in GKE by running the command kubectl apply -f statefulset.yaml",
    serviceId: "gke",
  },
  {
    id: "off-w2-sec1-q9",
    domain: "Compute",
    section: "1 · Designing & planning",
    official: true,
    prompt:
      "You are working in a mixed environment of VMs and Kubernetes. Some of your resources are on-premises, and some are in Google Cloud. Using containers as a part of your CI/CD pipeline has sped up releases significantly. You want to start migrating some of those VMs to containers so you can get similar benefits. You want to automate the migration process where possible.",
    options: [
      "Manually create a GKE cluster, and then use Migrate to Containers (Migrate for Anthos) to set up the cluster, import VMs, and convert them to containers",
      "Use Migrate to Containers (Migrate for Anthos) to automate the creation of Compute Engine instances to import VMs and convert them to containers",
      "Manually create a GKE cluster. Use Cloud Build to import VMs and convert them to containers",
      "Use Migrate for Compute Engine to import VMs and convert them to containers",
    ],
    answerIndex: 0,
    explanation:
      "Official answer: A. Manually create a GKE cluster, and then use Migrate to Containers (Migrate for Anthos) to set up the cluster, import VMs, and convert them to containers",
    serviceId: "gke",
  },
  {
    id: "off-w2-sec1-q10",
    domain: "Compute",
    section: "1 · Designing & planning",
    official: true,
    prompt:
      "Cymbal Direct has created a proof of concept for a social integration service that highlights images of its products from social media. The proof of concept is a monolithic application running on a single SuSE Linux virtual machine (VM). The current version requires increasing the VM’s CPU and RAM in order to scale. You would like to refactor the VM so that you can scale out instead of scaling up.",
    options: [
      "Move the existing codebase and VM provisioning scripts to git, and attach external persistent volumes to the VMs",
      "Make sure that the application declares any dependent requirements in a requirements.txt or equivalent statement so that they can be referenced in a startup script. Specify the startup script in a managed instance group template, and use an autoscaling policy",
      "Make sure that the application declares any dependent requirements in a requirements.txt or equivalent statement so that they can be referenced in a startup script, and attach external persistent volumes to the VMs",
      "Use containers instead of VMs, and use a GKE autoscaling deployment",
    ],
    answerIndex: 3,
    explanation:
      "Official answer: D. Use containers instead of VMs, and use a GKE autoscaling deployment",
    serviceId: "gke",
  },
  {
    id: "off-w3-sec2-q1",
    domain: "Networking",
    section: "2 · Managing & provisioning",
    official: true,
    prompt:
      "Cymbal Direct must meet compliance requirements. You need to ensure that employees with valid accounts cannot access their VPC network from locations outside of its secure corporate network, including from home. You also want a high degree of visibility into network traffic for auditing and forensics purposes.",
    options: [
      "Ensure that all users install Cloud VPN. Enable VPC Flow Logs for the networks you need to monitor",
      "Enable VPC Service Controls, define a network perimeter to restrict access to authorized networks, and enable VPC Flow Logs for the networks you need to monitor",
      "Enable Identity-Aware Proxy (IAP) to allow users to access services securely. Use Google Cloud’s operations suite to view audit logs for the networks you need to monitor",
      "Enable VPC Service Controls, and use Google Cloud’s operations suite to view audit logs for the networks you need to monitor",
    ],
    answerIndex: 1,
    explanation:
      "Official answer: B. Enable VPC Service Controls, define a network perimeter to restrict access to authorized networks, and enable VPC Flow Logs for the networks you need to monitor",
    serviceId: "hybrid-connectivity",
  },
  {
    id: "off-w3-sec2-q2",
    domain: "Compute",
    section: "2 · Managing & provisioning",
    official: true,
    prompt:
      "You are working with a client who has built a secure messaging application. The application is open source and consists of two components. The first component is a web app, written in Go, which is used to register an account and authorize the user’s IP address. The second is an encrypted chat protocol that uses TCP to talk to the backend chat servers running Debian. If the client's IP address doesn't match the registered IP address, the application is designed to terminate their session. The number of clients using the service varies greatly based on time of day, and the client wants to be able to easily scale as needed.",
    options: [
      "Deploy the web application using the App Engine standard environment using a global external HTTP(S) load balancer and a network endpoint group. Use an unmanaged instance group for the backend chat servers. Use an external network load balancer to load-balance traffic across the backend chat servers",
      "Deploy the web application using the App Engine flexible environment using a global external HTTP(S) load balancer and a network endpoint group. Use an unmanaged instance group for the backend chat servers. Use an external network load balancer to load-balance traffic across the backend chat servers",
      "Deploy the web application using the App Engine standard environment using a global external HTTP(S) load balancer and a network endpoint group. Use a managed instance group for the backend chat servers. Use a global SSL proxy load balancer to load-balance traffic across the backend chat servers",
      "Deploy the web application using the App Engine standard environment with a global external HTTP(S) load balancer and a network endpoint group. Use a managed instance group for the backend chat servers. Use an external network load balancer to load-balance traffic across the backend chat servers",
    ],
    answerIndex: 3,
    explanation:
      "Official answer: D. Deploy the web application using the App Engine standard environment with a global external HTTP(S) load balancer and a network endpoint group. Use a managed instance group for the backend chat servers. Use an external network load balancer to load-balance traffic across the backend chat servers",
    serviceId: "app-engine",
  },
  {
    id: "off-w3-sec2-q3",
    domain: "Storage & Databases",
    section: "2 · Managing & provisioning",
    official: true,
    prompt:
      "Cymbal Direct's user account management app allows users to delete their accounts whenever they like. Cymbal Direct also has a very generous 60-day return policy for users. The customer service team wants to make sure that they can still refund or replace items for a customer even if the customer’s account has been deleted. What can you do to ensure that the customer service team has access to relevant account information ?",
    options: [
      "Temporarily disable the account for 30 days. Export account information to Cloud Storage, and enable lifecycle management to delete the data in 60 days",
      "Ensure that the user clearly understands that after they delete their account, all their information will also be deleted. Remind them to download a copy of their order history and account information before deleting their account. Have the support agent copy any open or recent orders to a shared spreadsheet",
      "Restore a previous copy of the user information database from a snapshot. Have a database administrator capture needed information about the customer",
      "Disable the account. Export account information to Cloud Storage. Have the customer service team permanently delete the data after 30 days",
    ],
    answerIndex: 0,
    explanation:
      "Official answer: A. Temporarily disable the account for 30 days. Export account information to Cloud Storage, and enable lifecycle management to delete the data in 60 days",
    serviceId: "cloud-storage",
  },
  {
    id: "off-w3-sec2-q4",
    domain: "General",
    section: "2 · Managing & provisioning",
    official: true,
    prompt:
      "Cymbal Direct wants to create a pipeline to automate the building of new application releases. What sequence of steps should you use?",
    options: [
      "Set up a source code repository. Run unit tests. Check in code. Deploy. Build a Docker container",
      "Check in code. Set up a source code repository. Run unit tests. Deploy. Build a Docker container",
      "Set up a source code repository. Check in code. Run unit tests. Build a Docker container. Deploy",
      "Run unit tests. Deploy. Build a Docker container. Check in code. Set up a source code repository",
    ],
    answerIndex: 2,
    explanation:
      "Official answer: C. Set up a source code repository. Check in code. Run unit tests. Build a Docker container. Deploy",
  },
  {
    id: "off-w3-sec2-q5",
    domain: "Compute",
    section: "2 · Managing & provisioning",
    official: true,
    prompt:
      "Your existing application runs on Ubuntu Linux VMs in an on-premises hypervisor. You want to deploy the application to Google Cloud with minimal refactoring.",
    options: [
      "Set up a Google Kubernetes Engine (GKE) cluster, and then create a deployment with an autoscaler",
      "Isolate the core features that the application provides. Use Cloud Run to deploy each feature independently as a microservice",
      "Use X or Partner Interconnect to connect the on-premises network where your application is running to your VPC. Configure an endpoint for a global external HTTP(S) load balancer that connects to the existing VMs",
      "Write Terraform scripts to deploy the application as Compute Engine instances",
    ],
    answerIndex: 3,
    explanation:
      "Official answer: D. Write Terraform scripts to deploy the application as Compute Engine instances",
    serviceId: "gke",
  },
  {
    id: "off-w3-sec2-q6",
    domain: "Compute",
    section: "2 · Managing & provisioning",
    official: true,
    prompt:
      "Cymbal Direct needs to use a tool to deploy its infrastructure. You want something that allows for repeatable deployment processes, uses a declarative language, and allows parallel deployment. You also want to deploy infrastructure as code on Google Cloud and other cloud providers.",
    options: [
      "Automate the deployment with Terraform scripts",
      "Automate the deployment using scripts containing gcloud commands",
      "Use Google Kubernetes Engine (GKE) to create deployments and manifests for your applications",
      "Develop in Docker containers for portability and ease of deployment",
    ],
    answerIndex: 0,
    explanation:
      "Official answer: A. Automate the deployment with Terraform scripts",
    serviceId: "gke",
  },
  {
    id: "off-w3-sec2-q7",
    domain: "General",
    section: "2 · Managing & provisioning",
    official: true,
    prompt:
      "Cymbal Direct wants to allow partners to make orders programmatically, without having to speak on the phone with an agent. What should you consider when designing the API ?",
    options: [
      "The API backend should be loosely coupled. Clients should not be required to know too many details of the services they use. REST APIs using gRPC should be used for all external APIs",
      "The API backend should be tightly coupled. Clients should know a significant amount about the services they use. REST APIs using gRPC should be used for all external APIs",
      "The API backend should be loosely coupled. Clients should not be required to know too many details of the services they use. For REST APIs, HTTP(S) is the most common protocol",
      "The API backend should be tightly coupled. Clients should know a significant amount about the services they use. For REST APIs, HTTP(S) is the most common protocol used",
    ],
    answerIndex: 2,
    explanation:
      "Official answer: C. The API backend should be loosely coupled. Clients should not be required to know too many details of the services they use. For REST APIs, HTTP(S) is the most common protocol",
  },
  {
    id: "off-w3-sec2-q8",
    domain: "Compute",
    section: "2 · Managing & provisioning",
    official: true,
    prompt:
      "Cymbal Direct wants a layered approach to security when setting up Compute Engine instances. What are some options you could use to make your Compute Engine instances more secure ?",
    options: [
      "Use labels to allow traffic only from certain sources and ports. Turn on Secure boot and vTPM",
      "Use labels to allow traffic only from certain sources and ports. Use a Compute Engine service account",
      "Use network tags to allow traffic only from certain sources and ports. Turn on Secure boot and vTPM",
      "Use network tags to allow traffic only from certain sources and ports. Use a Compute Engine service account",
    ],
    answerIndex: 2,
    explanation:
      "Official answer: C. Use network tags to allow traffic only from certain sources and ports. Turn on Secure boot and vTPM",
    serviceId: "gce",
  },
  {
    id: "off-w3-sec2-q9",
    domain: "Compute",
    section: "2 · Managing & provisioning",
    official: true,
    prompt:
      "You have deployed your frontend web application in Kubernetes. Based on historical use, you need three pods to handle normal demand. Occasionally your load will roughly double. A load balancer is already in place. How could you configure your environment to efficiently meet that demand?",
    options: [
      "Edit your pod's configuration file and change the number of replicas to six",
      "Edit your deployment's configuration file and change the number of replicas to six",
      "Use the \"kubectl autoscale\" command to change the pod's maximum number of instances to six",
      "Use the \"kubectl autoscale\" command to change the deployment’s maximum number of instances to six",
    ],
    answerIndex: 3,
    explanation:
      "Official answer: D. Use the \"kubectl autoscale\" command to change the deployment’s maximum number of instances to six",
    serviceId: "gke",
  },
  {
    id: "off-w3-sec2-q10",
    domain: "Compute",
    section: "2 · Managing & provisioning",
    official: true,
    prompt:
      "You need to deploy a load balancer for a web-based application with multiple backends in different regions. You want to direct traffic to the backend closest to the end user, but also to different backends based on the URL the user is accessing. Which of the following could be used to implement this?",
    options: [
      "The request is received by the global external HTTP(S) load balancer. A global forwarding rule sends the request to a target proxy, which checks the URL map and selects the backend service. The backend service sends the request to Compute Engine instance groups in multiple regions",
      "The request is matched by a URL map and then sent to a global external HTTP(S) load balancer. A global forwarding rule sends the request to a target proxy, which selects a backend service. The backend service sends the request to Compute Engine instance groups in multiple regions",
      "The request is received by the SSL proxy load balancer, which uses a global forwarding rule to check the URL map, then sends the request to a backend service. The request is processed by Compute Engine instance groups in multiple regions",
      "The request is matched by a URL map and then sent to a SSL proxy load balancer. A global forwarding rule sends the request to a target proxy, which selects a backend service and sends the request to Compute Engine instance groups in multiple regions",
    ],
    answerIndex: 0,
    explanation:
      "Official answer: A. The request is received by the global external HTTP(S) load balancer. A global forwarding rule sends the request to a target proxy, which checks the URL map and selects the backend service. The backend service sends the request to Compute Engine instance groups in multiple regions",
    serviceId: "gce",
  },
  {
    id: "off-w3-cs-ehr-q1",
    domain: "Networking",
    section: "2 · Managing & provisioning",
    caseStudy: "ehr",
    official: true,
    prompt:
      "For this question, refer to the EHR Healthcare case study. You need to define the technical architecture for hybrid connectivity between EHR's on-premises systems and Google Cloud. You want to follow Google's recommended practices for production-level applications. Considering the EHR Healthcare business and technical requirements, what should you do?",
    options: [
      "Configure two Partner Interconnect connections in one metro (City), and make sure the Interconnect connections are placed in different metro zones",
      "Configure two VPN connections from on-premises to Google Cloud, and make sure the VPN devices on-premises are in separate racks",
      "Configure Direct Peering between EHR Healthcare and Google Cloud, and make sure you are peering at least two Google locations",
      "Configure two Dedicated Interconnect connections in one metro (City) and two connections in another metro, and make sure the Interconnect connections are placed in different metro zones",
    ],
    answerIndex: 3,
    explanation:
      "Official answer: D. Configure two Dedicated Interconnect connections in one metro (City) and two connections in another metro, and make sure the Interconnect connections are placed in different metro zones",
    serviceId: "cloud-interconnect",
  },
  {
    id: "off-w3-cs-ehr-q2",
    domain: "Compute",
    section: "2 · Managing & provisioning",
    caseStudy: "ehr",
    official: true,
    prompt:
      "For this question, refer to the EHR Healthcare case study. In the past, configuration errors put public IP addresses on backend servers that should not have been accessible from the Internet. You need to ensure that no one can put external IP addresses on backend Compute Engine instances and that external IP addresses can only be configured on frontend Compute Engine instances.",
    options: [
      "Create an Organizational Policy with a constraint to allow external IP addresses only on the frontend Compute Engine instances",
      "Revoke the compute.networkAdmin role from all users in the project with front end instances",
      "Create an Identity and Access Management (IAM) policy that maps the IT staff to the compute.networkAdmin role for the organization",
      "Create a custom Identity and Access Management (IAM) role named GCE_FRONTEND with the compute.addresses.create permission",
    ],
    answerIndex: 0,
    explanation:
      "Official answer: A. Create an Organizational Policy with a constraint to allow external IP addresses only on the frontend Compute Engine instances",
    serviceId: "gce",
  },
  {
    id: "off-w3-cs-ehr-q3",
    domain: "Compute",
    section: "2 · Managing & provisioning",
    caseStudy: "ehr",
    official: true,
    prompt:
      "For this question, refer to the EHR Healthcare case study. You are responsible for ensuring that EHR's use of Google Cloud will pass an upcoming privacy compliance audit. What should you do? (Choose two.)",
    options: [
      "Verify EHR's product usage against the list of",
      "Advise EHR to execute a Business Associate Agreement",
      "Use Firebase Authentication for EHR's user facing applications",
      "Implement Prometheus to detect and prevent security breaches on EHR's web-based applications. E. Use GKE private clusters for all Kubernetes workloads",
    ],
    answerIndex: [0,1],
    explanation:
      "Official answer: A,B. Verify EHR's product usage against the list of; Advise EHR to execute a Business Associate Agreement",
    serviceId: "gke",
  },
  {
    id: "off-w4-sec3-q1",
    domain: "Security",
    section: "3 · Security & compliance",
    official: true,
    prompt:
      "Your client created an Identity and Access Management (IAM) resource hierarchy with Google Cloud when the company was a startup. Your client has grown and now has multiple departments and teams. You want to recommend a resource hierarchy that follows Google-recommended practices.",
    options: [
      "Keep all resources in one project, and use a flat resource hierarchy to reduce complexity and simplify management",
      "Keep all resources in one project, but change the resource hierarchy to reflect company organization",
      "Use a flat resource hierarchy and multiple projects with established trust boundaries",
      "Use multiple projects with established trust boundaries, and change the resource hierarchy to reflect company organization",
    ],
    answerIndex: 3,
    explanation:
      "Official answer: D. Use multiple projects with established trust boundaries, and change the resource hierarchy to reflect company organization",
    serviceId: "iam",
  },
  {
    id: "off-w4-sec3-q2",
    domain: "Security",
    section: "3 · Security & compliance",
    official: true,
    prompt:
      "Cymbal Direct’s social media app must run in a separate project from its APIs and web store. You want to use Identity and Access Management (IAM) to ensure a secure environment. How should you set up IAM?",
    options: [
      "Use separate service accounts for each component (social media app, APIs, and web store) with basic roles to grant access",
      "Use one service account for all components (social media app, APIs, and web store) with basic roles to grant access",
      "Use separate service accounts for each component (social media app, APIs, and web store) with predefined or custom roles to grant access",
      "Use one service account for all components (social media app, APIs, and web store) with predefined or custom roles to grant access",
    ],
    answerIndex: 2,
    explanation:
      "Official answer: C. Use separate service accounts for each component (social media app, APIs, and web store) with predefined or custom roles to grant access",
    serviceId: "iam",
  },
  {
    id: "off-w4-sec3-q3",
    domain: "General",
    section: "3 · Security & compliance",
    official: true,
    prompt:
      "Michael is the owner/operator of “Zneeks,” a retail shoe store that caters to sneaker aficionados. He regularly works with customers who order small batches of custom shoes. Michael is interested in using Cymbal Direct to manufacture and ship custom batches of shoes to these customers. Reasonably tech-savvy but not a developer, Michael likes using Cymbal Direct's partner purchase portal but wants the process to be easy. What is an example of a user story that could describe Michael’s persona?",
    options: [
      "As a shoe retailer, Michael wants to send Cymbal Direct custom purchase orders so that batches of custom shoes are sent to his customers",
      "Michael is a tech-savvy owner/operator of a small business",
      "Zneeks is a retail shoe store that caters to sneaker aficionados",
      "Michael is reasonably tech-savvy but needs Cymbal Direct's partner purchase portal to be easy",
    ],
    answerIndex: 0,
    explanation:
      "Official answer: A. As a shoe retailer, Michael wants to send Cymbal Direct custom purchase orders so that batches of custom shoes are sent to his customers",
  },
  {
    id: "off-w4-sec3-q4",
    domain: "Compute",
    section: "3 · Security & compliance",
    official: true,
    prompt:
      "Cymbal Direct has an application running on a Compute Engine instance. You need to give the application access to several Google Cloud services. You do not want to keep any credentials on the VM instance itself.",
    options: [
      "Create a service account for each of the services the VM needs to access. Associate the service accounts with the Compute Engine instance",
      "Create a service account and assign it the project owner role, which enables access to any needed service",
      "Create a service account for the instance. Use Access scopes to enable access to the required services",
      "Create a service account with one or more predefined or custom roles, which give access to the required services",
    ],
    answerIndex: 3,
    explanation:
      "Official answer: D. Create a service account with one or more predefined or custom roles, which give access to the required services",
    serviceId: "gce",
  },
  {
    id: "off-w4-sec3-q5",
    domain: "Security",
    section: "3 · Security & compliance",
    official: true,
    prompt:
      "Cymbal Direct wants to use Identity and Access Management (IAM) to allow employees to have access to Google Cloud resources and services based on their job roles. Several employees are project managers and want to have some level of access to see what has been deployed. The security team wants to ensure that securing the environment and managing resources is simple so that it will scale. What approach should you use?",
    options: [
      "Grant access by assigning custom roles to groups. Use multiple groups for better control. Give access as low in the hierarchy as possible to prevent the inheritance of too many abilities from a higher level",
      "Grant access by assigning predefined roles to groups. Use multiple groups for better control. Give access as low in the hierarchy as possible to prevent the inheritance of too many abilities from a higher level",
      "Give access directly to each individual for more granular control. Give access as low in the hierarchy as possible to prevent the inheritance of too many abilities from a higher level",
      "Grant access by assigning predefined roles to groups. Use multiple groups for better control. Make sure you give out access to all the children in a hierarchy under the level needed, because child resources will not automatically inherit abilities",
    ],
    answerIndex: 1,
    explanation:
      "Official answer: B. Grant access by assigning predefined roles to groups. Use multiple groups for better control. Give access as low in the hierarchy as possible to prevent the inheritance of too many abilities from a higher level",
    serviceId: "iam",
  },
  {
    id: "off-w4-sec3-q6",
    domain: "Compute",
    section: "3 · Security & compliance",
    official: true,
    prompt:
      "You have several Compute Engine instances running NGINX and Tomcat for a web application. In your web server logs, many login failures come from a single IP address, which looks like a brute force attack. How can you block this traffic?",
    options: [
      "Edit the Compute Engine instances running your web application, and enable Google Cloud Armor. Create a Google Cloud Armor policy with a default rule action of \"Allow.\" Add a new rule that specifies the IP address causing the login failures as the Condition, with an action of \"Deny” and a deny status of \"403,\" and accept the default priority (1000)",
      "Ensure that an HTTP(S) load balancer is configured to send traffic to the backend Compute Engine instances running your web server. Create a Google Cloud Armor policy with a default rule action of \"Deny.\" Add a new rule that specifies the IP address causing the login failures as the Condition, with an action of \"Deny\" and a deny status of \"403,\" and accept the default priority (1000). Add the load balancer backend service's HTTP-backend as the target",
      "Ensure that an HTTP(S) load balancer is configured to send traffic to the backend Compute Engine instances running your web server. Create a Google Cloud Armor policy with a default rule action of \"Allow.\" Add a new rule that specifies the IP address causing the login failures as the Condition, with an action of \"Deny\" and a deny status of \"403,\" and accept the default priority (1000). Add the load balancer backend service's HTTP-backend as the target",
      "Ensure that an HTTP(S) load balancer is configured to send traffic to your backend Compute Engine instances running your web server. Create a Google Cloud Armor policy using the instance’s local firewall with a default rule action of \"Allow.\" Add a new local firewall rule that specifies the IP address causing the login failures as the Condition, with an action of \"Deny\" and a deny status of \"403,\" and accept the default priority (1000)",
    ],
    answerIndex: 2,
    explanation:
      "Official answer: C. Ensure that an HTTP(S) load balancer is configured to send traffic to the backend Compute Engine instances running your web server. Create a Google Cloud Armor policy with a default rule action of \"Allow.\" Add a new rule that specifies the IP address causing the login failures as the Condition, with an action of \"Deny\" and a deny status of \"403,\" and accept the default priority (1000). Add the load balancer backend service's HTTP-backend as the target",
    serviceId: "gce",
  },
  {
    id: "off-w4-sec3-q7",
    domain: "Networking",
    section: "3 · Security & compliance",
    official: true,
    prompt:
      "Cymbal Direct needs to make sure its new social media integration service can’t be accessed directly from the public internet. You want to allow access only through the web frontend store. How can you prevent access to the social media integration service from the outside world, but still allow access to the APIs of social media services?",
    options: [
      "Remove external IP addresses from the VM instances running the social media service and place them in a private VPC behind Cloud NAT. Any SSH connection for management should be done with Identity-Aware Proxy (IAP) or a bastion host (jump box) after allowing SSH access from IAP or a corporate network",
      "Limit access to the external IP addresses of the VM instances using firewall rules and place them in a private VPC behind Cloud NAT. Any SSH connection for management should be done with Identity-Aware Proxy (IAP) or a bastion host (jump box) after allowing SSH access from IAP or a corporate network",
      "Limit access to the external IP addresses of the VM instances using a firewall rule to block all outbound traffic. Any SSH connection for management should be done with Identity-Aware Proxy (IAP) or a bastion host (jump box) after allowing SSH access from IAP or a corporate network",
      "Remove external IP addresses from the VM instances running the social media service and place them in a private VPC behind Cloud NAT. Any SSH connection for management should be restricted to corporate network IP addresses by Google Cloud Armor",
    ],
    answerIndex: 0,
    explanation:
      "Official answer: A. Remove external IP addresses from the VM instances running the social media service and place them in a private VPC behind Cloud NAT. Any SSH connection for management should be done with Identity-Aware Proxy (IAP) or a bastion host (jump box) after allowing SSH access from IAP or a corporate network",
    serviceId: "cloud-nat",
  },
  {
    id: "off-w4-sec3-q8",
    domain: "Compute",
    section: "3 · Security & compliance",
    official: true,
    prompt:
      "Cymbal Direct is experiencing success using Google Cloud and you want to leverage tools to make your solutions more efficient. Erik, one of the original web developers, currently adds new products to your application manually. Erik has many responsibilities and requires a long lead time to add new products. You need to create a Cloud Functions application to l et Cymbal Direct employees add new products instead of waiting for Erik. However, you want to make sure that only authorized employees can use the application.",
    options: [
      "Set up Cloud VPN between the corporate network and the Google Cloud project's VPC network. Allow users to connect to the Cloud Functions instance",
      "Use Google Cloud Armor to restrict access to the corporate network's external IP address. Configure firewall rules to allow only HTTP(S) access",
      "Create a Google group and add authorized employees to it. Configure Identity-Aware Proxy (IAP) to the Cloud Functions application as a HTTP-resource. Add the group as a principle with the role \"Project Owner.\"",
      "Create a Google group and add authorized employees to it. Configure Identity-Aware Proxy (IAP) to the Cloud Functions application as a HTTP-resource. Add the group as a principle with the role \"IAP-secured Web App User.\"",
    ],
    answerIndex: 3,
    explanation:
      "Official answer: D. Create a Google group and add authorized employees to it. Configure Identity-Aware Proxy (IAP) to the Cloud Functions application as a HTTP-resource. Add the group as a principle with the role \"IAP-secured Web App User.\"",
    serviceId: "cloud-functions",
  },
  {
    id: "off-w4-sec3-q9",
    domain: "Storage & Databases",
    section: "3 · Security & compliance",
    official: true,
    prompt:
      "You've recently created an internal Cloud Run application for developers in your organization. The application lets developers clone production Cloud SQL databases into a project specifically created to test code and deployments. Your previous process was to export a database to a Cloud Storage bucket, and then import the SQL dump into a legacy on-premises testing environment database with connectivity to Google Cloud via Cloud VPN. Management wants to incentivize using the new process with Cloud SQL for rapid testing and track how frequently rapid testing occurs. How can you ensure that the developers use the new process?",
    options: [
      "Use an ACL on the Cloud Storage bucket. Create a read-only group that only has viewer privileges, and ensure that the developers are in that group",
      "Leave the ACLs on the Cloud Storage bucket as-is. Disable Cloud VPN, and have developers use Identity-Aware Proxy (IAP) to connect. Create an organization policy to enforce public access protection",
      "Use predefined roles to restrict access to what the developers are allowed to do. Create a group for the developers, and associate the group with the Cloud SQL Viewer role. Remove the \"cloudsql.instances.export\" ability from the role",
      "Create a custom role to restrict access to what developers are allowed to do. Create a group for the developers, and associate the group with your custom role. Ensure that the custom role does not have \"cloudsql.instances.export.\"",
    ],
    answerIndex: 3,
    explanation:
      "Official answer: D. Create a custom role to restrict access to what developers are allowed to do. Create a group for the developers, and associate the group with your custom role. Ensure that the custom role does not have \"cloudsql.instances.export.\"",
    serviceId: "cloud-sql",
  },
  {
    id: "off-w4-sec3-q10",
    domain: "Security",
    section: "3 · Security & compliance",
    official: true,
    prompt:
      "Your client is legally required to comply with the Payment Card Industry Data Security Standard (PCI-DSS). The client has formal audits already, but the audits are only done periodically. The client needs to monitor for common violations to meet those requirements more easily. The client does not want to replace audits but wants to engage in continuous compliance and catch violations early. What would you recommend that this client do?",
    options: [
      "Enable the Security Command Center (SCC) dashboard, asset discovery, and Security Health Analytics in the Premium tier. Export or view the PCI-DSS Report from the SCC dashboard's Compliance tab",
      "Enable the Security Command Center (SCC) dashboard, asset discovery, and Security Health Analytics in the Standard tier. Export or view the PCI-DSS Report from the SCC dashboard's Compliance tab",
      "Enable the Security Command Center (SCC) dashboard, asset discovery, and Security Health Analytics in the Premium tier. Export or view the PCI-DSS Report from the SCC dashboard's Vulnerabilities tab",
      "Enable the Security Command Center (SCC) dashboard, asset discovery, and Security Health Analytics in the Standard tier. Export or view the PCI-DSS Report from the SCC dashboard's Vulnerabilities tab",
    ],
    answerIndex: 0,
    explanation:
      "Official answer: A. Enable the Security Command Center (SCC) dashboard, asset discovery, and Security Health Analytics in the Premium tier. Export or view the PCI-DSS Report from the SCC dashboard's Compliance tab",
    serviceId: "compliance-mapping",
  },
  {
    id: "off-w4-cs-altostrat-q1",
    domain: "Storage & Databases",
    section: "3 · Security & compliance",
    caseStudy: "altostrat",
    official: true,
    prompt:
      "Altostrat Media stores a vast and growing library of video content in Cloud Storage. The majority of their archived documentaries (which comprise 60% of their total volume) are accessed less than four times per year, and many are retained for long-term regulatory purposes. Altostrat needs to immediately optimize cloud storage costs for these growing media volumes while ensuring long-term retention requirements are met and maintaining high availability for serving the content globally Which storage solution best balances cost optimization, global availability, and long-term regulatory compliance?",
    options: [
      "Use a Multi-Regional Cloud Storage bucket and apply an Object Lifecycle Management policy to transition objects accessed less than once a year to Archive Storage",
      "Use a Regional Coldline Storage bucket, and rely on Object Versioning for long-term retention assurance",
      "Store all content in a Multi-Regional Standard Storage bucket to ensure high availability, and manually move documentary assets to Archive Storage only after 12 months using a scheduled data job",
      "Use a Dual-Region Nearline Storage bucket, ensuring objects are moved to Coldline Storage after 90 days of inactivity using Object Lifecycle Management",
    ],
    answerIndex: 0,
    explanation:
      "Official answer: A. Use a Multi-Regional Cloud Storage bucket and apply an Object Lifecycle Management policy to transition objects accessed less than once a year to Archive Storage",
    serviceId: "cloud-storage",
  },
  {
    id: "off-w4-cs-altostrat-q2",
    domain: "Data & AI",
    section: "3 · Security & compliance",
    caseStudy: "altostrat",
    official: true,
    prompt:
      "Altostrat Media aimed for enhanced reach and personalization. From an architectural perspective, how would you design a solution on GCP to dynamically segment audiences and deliver personalized ad content at scale, considering both batch and real-time data processing needs?",
    options: [
      "Utilize Dataflow for ETL from disparate sources into Cloud SQL, then integrate with Marketing Platform",
      "Ingest real-time events via Pub/Sub to Dataflow for stream processing and feature engineering, storing results in BigQuery for ML model training with Vertex AI, and serving predictions via custom APIs on Cloud Run",
      "Store all data in Cloud Storage buckets, use Dataproc for occasional batch processing, and manually update ad campaigns",
      "Implement App Engine to host custom audience segmentation logic and connect directly to ad networks",
    ],
    answerIndex: 1,
    explanation:
      "Official answer: B. Ingest real-time events via Pub/Sub to Dataflow for stream processing and feature engineering, storing results in BigQuery for ML model training with Vertex AI, and serving predictions via custom APIs on Cloud Run",
    serviceId: "dataflow",
  },
  {
    id: "off-w4-cs-altostrat-q3",
    domain: "Data & AI",
    section: "3 · Security & compliance",
    caseStudy: "altostrat",
    official: true,
    prompt:
      "A key business requirement is to enable natural language interaction with the platform and provide 24/7 personalized user support via advanced chatbots. This chatbot needs to utilize Natural Language Understanding (NLU) to answer complex queries about content and suggest personalized recommendations. should be used to build and deploy this critical user engagement component?",
    options: [
      "Use a custom Python script deployed on a managed instance group (MIG) for NLU, and integrate it with BigQuery ML for recommendations",
      "Use a monolithic Node.js application deployed on GKE to manage all user interactions and recommendation logic",
      "Utilize the Natural Language API directly within Cloud Functions to analyze user text input, avoiding any need for stateful conversational platforms",
      "Leverage Conversational AI (such as Dialogflow or Vertex AI's NLU capabilities) to handle user interaction and intent recognition",
    ],
    answerIndex: 3,
    explanation:
      "Official answer: D. Leverage Conversational AI (such as Dialogflow or Vertex AI's NLU capabilities) to handle user interaction and intent recognition",
    serviceId: "bigquery",
  },
  {
    id: "off-w4-cs-altostrat-q4",
    domain: "Compute",
    section: "3 · Security & compliance",
    caseStudy: "altostrat",
    official: true,
    prompt:
      "Altostrat currently relies on Cloud Monitoring and Prometheus, but alerts for critical system issues are primarily delivered via email. To accelerate and enhance the reliability of operational workflows, the architecture team needs to implement a low-latency, highly reliable alerting mechanism for major issues (e.g., GKE cluster failure or high-priority transcoding errors) What action should the architect take to improve the immediacy and reliability of critical alerts?",
    options: [
      "Set up a dedicated Compute Engine instance to continuously parse incoming email alerts and manually execute runbooks",
      "Increase the retention period of Prometheus metrics to allow for better post-mortem analysis",
      "Configure Cloud Monitoring to integrate with an external service like PagerDuty or Slack via Notification Channels",
      "Use Cloud Deployment Manager to standardize the deployment of existing Cloud Monitoring dashboards",
    ],
    answerIndex: 2,
    explanation:
      "Official answer: C. Configure Cloud Monitoring to integrate with an external service like PagerDuty or Slack via Notification Channels",
    serviceId: "gke",
  },
  {
    id: "off-w4-cs-altostrat-q5",
    domain: "Storage & Databases",
    section: "3 · Security & compliance",
    caseStudy: "altostrat",
    official: true,
    prompt:
      "Altostrat deploys new applications with stateful information (like user management data) on GKE and uses Cloud SQL for the managed relational database backend. To ensure low latency and improved network security, the Cloud SQL instance is configured with a Private IP. Which is the most secure and recommended way to ensure the GKE pods can connect reliably to the Cloud SQL instance?",
    options: [
      "Enable a Public IP address on the Cloud SQL instance and use SSL certificates for connection",
      "Set up a dedicated VM as a jump host within the VPC network to proxy all database connections",
      "Use the Cloud SQL Auth Proxy running as a sidecar container within the GKE pods to manage secure, IAM-based connectivity over the Private Service Access network",
      "Configure the Cloud SQL instance with an Authorized Network (CIDR block) that encompasses the entire GKE node IP range",
    ],
    answerIndex: 2,
    explanation:
      "Official answer: C. Use the Cloud SQL Auth Proxy running as a sidecar container within the GKE pods to manage secure, IAM-based connectivity over the Private Service Access network",
    serviceId: "cloud-sql",
  },
  {
    id: "off-w5-sec4-q1",
    domain: "Operations",
    section: "4 · Analyzing & optimizing",
    official: true,
    prompt:
      "You are asked to implement a lift and shift operation for Cymbal Direct’s Social Media Highlighting service. You compose a Terraform configuration file to build all the necessary Google Cloud resources. What is the next step in the Terraform What should you do? workflow for this effort?",
    options: [
      "Commit the configuration file to your software repository",
      "Run terraform plan to verify the contents of the Terraform configuration file",
      "Run terraform apply to deploy the resources described in the configuration file",
      "Run terraform init to download the necessary provider modules",
    ],
    answerIndex: 3,
    explanation:
      "Official answer: D. Run terraform init to download the necessary provider modules",
    serviceId: "iac",
  },
  {
    id: "off-w5-sec4-q2",
    domain: "Operations",
    section: "4 · Analyzing & optimizing",
    official: true,
    prompt:
      "You have implemented a manual CI/CD process for the container services required for the next implementation of the Cymbal Direct’s Drone Delivery project. You want to automate the process.",
    options: [
      "Implement and reference a source repository in your Cloud Build configuration file",
      "Implement a build trigger that applies your build configuration when a new software update is committed to Cloud Source Repositories",
      "Specify the name of your Container Registry in your Cloud Build configuration",
      "Configure and push a manifest fil e into an environment repository in Cloud Source Repositories",
    ],
    answerIndex: 1,
    explanation:
      "Official answer: B. Implement a build trigger that applies your build configuration when a new software update is committed to Cloud Source Repositories",
    serviceId: "cloud-build",
  },
  {
    id: "off-w5-sec4-q3",
    domain: "Compute",
    section: "4 · Analyzing & optimizing",
    official: true,
    prompt:
      "You have an application implemented on Compute Engine. You want to increase the durability of your application.",
    options: [
      "Implement a scheduled snapshot on your Compute Engine instances",
      "Implement a regional managed instance group",
      "Monitor your application’s usage metrics and implement autoscaling",
      "Perform health checks on your Compute Engine instances",
    ],
    answerIndex: 0,
    explanation:
      "Official answer: A. Implement a scheduled snapshot on your Compute Engine instances",
    serviceId: "gce",
  },
  {
    id: "off-w5-sec4-q4",
    domain: "Operations",
    section: "4 · Analyzing & optimizing",
    official: true,
    prompt:
      "Developers on your team frequently write new versions of the code for one of your applications. You want to automate the build process when updates are pushed to Cloud Source Repositories.",
    options: [
      "Implement a Cloud Build configuration file with build steps",
      "Implement a build trigger that references your repository and branch",
      "Set proper permissions for Cloud Build to access deployment resources",
      "Upload application updates and Cloud Build configuration files to Cloud Source Repositories",
    ],
    answerIndex: 1,
    explanation:
      "Official answer: B. Implement a build trigger that references your repository and branch",
    serviceId: "cloud-build",
  },
  {
    id: "off-w5-sec4-q5",
    domain: "Operations",
    section: "4 · Analyzing & optimizing",
    official: true,
    prompt:
      "Your development team used Cloud Source Repositories, Cloud Build, and Artifact Registry to successfully implement the build portion of an application's CI/CD process.. However, the deployment process is erroring out. Initial troubleshooting shows that the runtime environment does not have access to the build images. You need to advise the team on how to resolve the issue. What could cause this problem?",
    options: [
      "The r untime environment does not have permissions to the Artifact Registry in your current project",
      "The runtime environment does not have permissions t o Cloud Source Repositories in your current project",
      "The Artifact Registry might be in a different project",
      "You need to specify the Artifact Registry image by name",
    ],
    answerIndex: 2,
    explanation:
      "Official answer: C. The Artifact Registry might be in a different project",
    serviceId: "cloud-build",
  },
  {
    id: "off-w5-sec4-q6",
    domain: "Reliability",
    section: "4 · Analyzing & optimizing",
    official: true,
    prompt:
      "You are implementing a disaster recovery plan for the cloud version of your drone solution. Sending videos to the pilots is crucial from an operational perspective. What design pattern should you choose for this part of your architecture?",
    options: [
      "Hot with a low recovery time objective (RTO)",
      "Warm with a high recovery time objective (RTO)",
      "Cold with a low recovery time objective (RTO)",
      "Hot with a high recovery time objective (RTO)",
    ],
    answerIndex: 0,
    explanation:
      "Official answer: A. Hot with a low recovery time objective (RTO)",
    serviceId: "dr-strategy",
  },
  {
    id: "off-w5-sec4-q7",
    domain: "General",
    section: "4 · Analyzing & optimizing",
    official: true,
    prompt:
      "The number of requests received by your application is nearing the maximum specified in your design. You want to limit the number of incoming requests until the system can handle the workload. What design pattern does this situation describe?",
    options: [
      "Applying a circuit breaker",
      "Applying exponential backoff",
      "Increasing jitter",
      "Applying graceful degradation",
    ],
    answerIndex: 0,
    explanation:
      "Official answer: A. Applying a circuit breaker",
  },
  {
    id: "off-w5-sec4-q8",
    domain: "Compute",
    section: "4 · Analyzing & optimizing",
    official: true,
    prompt:
      "The pilot subsystem in your Delivery by Drone service is critical to your service. You want to ensure that connections to the pilots can survive a VM outage without affecting connectivity.",
    options: [
      "Configure proper startup scripts for your VMs",
      "Deploy a load balancer to distribute traffic across multiple machines",
      "Create persistent disk snapshots",
      "Implement a managed instance group and load balancer",
    ],
    answerIndex: 3,
    explanation:
      "Official answer: D. Implement a managed instance group and load balancer",
    serviceId: "gce",
  },
  {
    id: "off-w5-sec4-q9",
    domain: "General",
    section: "4 · Analyzing & optimizing",
    official: true,
    prompt:
      "Cymbal Direct wants to improve its drone pilot interface. You want to collect feedback on proposed changes from the community of pilots before rolling out updates systemwide. What type of deployment pattern should you implement?",
    options: [
      "You should implement canary testing",
      "You should implement A/B testing",
      "You should implement a blue/green deployment",
      "You should implement an in-place release",
    ],
    answerIndex: 1,
    explanation:
      "Official answer: B. You should implement A/B testing",
  },
  {
    id: "off-w5-sec4-q10",
    domain: "General",
    section: "4 · Analyzing & optimizing",
    official: true,
    prompt:
      "You want to establish procedures for testing the resilience of the delivery-by-drone solution. How would you simulate a scalability issue?",
    options: [
      "Block access to storage assets in one of your zones",
      "Inject a bad health check f or one or more of your resources",
      "Load test your application to see how it responds",
      "Block access to all resources in a zone",
    ],
    answerIndex: 2,
    explanation:
      "Official answer: C. Load test your application to see how it responds",
  },
  {
    id: "off-w5-cs-cymbal-q1",
    domain: "Data & AI",
    section: "4 · Analyzing & optimizing",
    caseStudy: "cymbal",
    official: true,
    prompt:
      "Cymbal Retail's current environment has data silos across various databases (MySQL, Microsoft SQL Server, Redis, and MongoDB), which limits a unified view of the customer. They want to create a centralized data platform to get a holistic view of their customers and enable advanced analytics. most appropriate foundation for this centralized data platform?",
    options: [
      "Cloud SQL",
      "Bigtable",
      "Firestore",
      "BigQuery",
    ],
    answerIndex: 3,
    explanation:
      "Official answer: D. BigQuery",
    serviceId: "bigquery",
  },
  {
    id: "off-w5-cs-cymbal-q2",
    domain: "Compute",
    section: "4 · Analyzing & optimizing",
    caseStudy: "cymbal",
    official: true,
    prompt:
      "Cymbal Retail's custom-built web application experiences significant traffic fluctuations. They want to ensure that the application can handle traffic spikes without manual intervention while minimizing costs. The application is containerized and runs on Kubernetes. Which GKE feature should they leverage to achieve this?",
    options: [
      "Horizontal Pod Autoscaler (HPA)",
      "Vertical Pod Autoscaler (VPA)",
      "Cluster Autoscaler",
      "A combination of HPA and Cluster Autoscaler",
    ],
    answerIndex: 3,
    explanation:
      "Official answer: D. A combination of HPA and Cluster Autoscaler",
    serviceId: "gke",
  },
  {
    id: "off-w5-cs-cymbal-q3",
    domain: "Data & AI",
    section: "4 · Analyzing & optimizing",
    caseStudy: "cymbal",
    official: true,
    prompt:
      "Cymbal Retail wants to implement a solution that can automatically generate high-quality images of their products in different settings and styles for their e-commerce website. Which Vertex AI service and model type would be most appropriate for this task?",
    options: [
      "Vertex AI Language with a text generation model",
      "Vertex AI with a generative adversarial network (GAN) model",
      "Vertex AI Vision with an image generation model (e.g., Imagen)",
      "Vertex AI Vision with a classification model",
    ],
    answerIndex: 2,
    explanation:
      "Official answer: C. Vertex AI Vision with an image generation model (e.g., Imagen)",
    serviceId: "vertex-ai",
  },
  {
    id: "off-w5-cs-cymbal-q4",
    domain: "Data & AI",
    section: "4 · Analyzing & optimizing",
    caseStudy: "cymbal",
    official: true,
    prompt:
      "Cymbal Retail wants to use Generative AI to provide their customer service agents with real-time assistance. The system should listen to customer calls, transcribe them in real-time, and suggest relevant answers and solutions from a knowledge base. Which combination of Google Cloud services would be best for this solution?",
    options: [
      "Speech-to-Text API, Vertex AI Language, and Cloud Storage",
      "Contact Center AI (CCAI) Platform, which integrates Speech-to-Text, Dialogflow, and Agent Assist",
      "Dialogflow CX, Speech-to-Text API, and BigQuery",
      "Cloud Pub/Sub, Cloud Functions, and the Speech-to-Text API",
    ],
    answerIndex: 1,
    explanation:
      "Official answer: B. Contact Center AI (CCAI) Platform, which integrates Speech-to-Text, Dialogflow, and Agent Assist",
    serviceId: "pubsub",
  },
  {
    id: "off-w5-cs-cymbal-q5",
    domain: "Data & AI",
    section: "4 · Analyzing & optimizing",
    caseStudy: "cymbal",
    official: true,
    prompt:
      "Cymbal Retail is building a product recommendation engine using Generative AI. The model should be able to recommend products based on a user's natural language query (e.g., \"show me some stylish and comfortable shoes for a summer wedding\"). Which approach would be most effective?",
    options: [
      "Use Vertex AI Search's semantic search capabilities to match user queries with relevant products",
      "Fine-tune a large language model (LLM) on Cymbal Retail's product catalog and customer reviews",
      "Use a traditional collaborative filtering model trained on user purchase data",
      "Build a custom model using TensorFlow and host it on Vertex AI Training",
    ],
    answerIndex: 0,
    explanation:
      "Official answer: A. Use Vertex AI Search's semantic search capabilities to match user queries with relevant products",
    serviceId: "vertex-ai",
  },
  {
    id: "off-w6-sec5-q1",
    domain: "Reliability",
    section: "5–6 · Implementation & reliability",
    official: true,
    prompt:
      "Cymbal Direct is working on a social media integration service in Google Cloud. Mahesh is a non-technical manager who wants to ensure that the project doesn’t exceed the budget and responds quickly to unexpected cost increases. You need to set up access and billing for the project.",
    options: [
      "Assign the predefined Billing Account Administrator role to Mahesh. Create a project budget. Configure billing alerts to be sent to the Billing Administrator. Use resource quotas to cap how many resources can be deployed",
      "Assign the predefined Billing Account Administrator role to Mahesh. Create a project budget. Configure billing alerts to be sent to the Project Owner. Use resource quotas to cap how much money can be spent",
      "Use the predefined Billing Account Administrator role for the Billing Administrator group, and assign Mahesh to the group. Create a project budget. Configure billing alerts to be sent to the Billing Account Administrator. Use resource quotas to cap how many resources can be deployed",
      "Use the predefined Billing Account Administrator role for the Billing Administrator group, and assign Mahesh to the group. Create a project budget. Configure billing alerts to be sent to the Billing Account Administrator. Use resource quotas to cap how much money can be spent",
    ],
    answerIndex: 2,
    explanation:
      "Official answer: C. Use the predefined Billing Account Administrator role for the Billing Administrator group, and assign Mahesh to the group. Create a project budget. Configure billing alerts to be sent to the Billing Account Administrator. Use resource quotas to cap how many resources can be deployed",
    serviceId: "cost-optimization",
  },
  {
    id: "off-w6-sec5-q2",
    domain: "Storage & Databases",
    section: "5–6 · Implementation & reliability",
    official: true,
    prompt:
      "Your organization is planning a disaster recovery (DR) strategy. Your stakeholders require a recovery time objective (RTO) of 0 and a recovery point objective (RPO) of 0 for zone outage. They require an RTO of 4 hours and an RPO of 1 hour for a regional outage. Your application consists of a web application and a backend MySQL database. You need the most efficient solution to meet your recovery KPIs.",
    options: [
      "Use a global HTTP(S) load balancer. Deploy the web application as Compute Engine managed instance groups (MIG) in two regions, us-west and us-east. Configure the load balancer to use both backends. Use Cloud SQL with high availability (HA) enabled in us-east and a cross-region replica in us-west",
      "Use a global HTTP(S) load balancer. Deploy the web application as Compute Engine managed instance groups (MIG) in two regions, us-west and us-east. Configure the load balancer to the us-east backend. Use Cloud SQL with high availability (HA) enabled in us-east and a cross-region replica in us-west. Manually promote the us-west Cloud SQL instance and change the load balancer backend to us-west",
      "Use a global HTTP(S) load balancer. Deploy the web application as Compute Engine managed instance groups (MIG) in two regions, us-west and us-east. Configure the load balancer to use both backends. Use Cloud SQL with high availability (HA) enabled in us-east and back up the database every hour to a multi-region Cloud Storage bucket. Restore the data to a Cloud SQL database in us-west if there is a failure",
      "Use a global HTTP(S) load balancer. Deploy the web application as Compute Engine managed instance groups (MIG) in two regions, us-west and us-east. Configure the load balancer to use both backends. Use Cloud SQL with high availability (HA) enabled in us-east and back up the database every hour to a multi-region Cloud Storage bucket. Restore the data to a Cloud SQL database in us-west if there is a failure and change the load balancer backend to us-west",
    ],
    answerIndex: 1,
    explanation:
      "Official answer: B. Use a global HTTP(S) load balancer. Deploy the web application as Compute Engine managed instance groups (MIG) in two regions, us-west and us-east. Configure the load balancer to the us-east backend. Use Cloud SQL with high availability (HA) enabled in us-east and a cross-region replica in us-west. Manually promote the us-west Cloud SQL instance and change the load balancer backend to us-west",
    serviceId: "cloud-sql",
  },
  {
    id: "off-w6-sec5-q3",
    domain: "Data & AI",
    section: "5–6 · Implementation & reliability",
    official: true,
    prompt:
      "Your environment has multiple projects used for development and testing. Each project has a budget, and each developer has a budget. A personal budget overrun can cause a project budget overrun. Several developers are creating resources for testing as part of their CI/CD pipeline but are not deleting these resources after their tests are complete. If the compute resource fails during testing, the test can be run again. You want to reduce costs and notify the developer when a personal budget overrun causes a project budget overrun.",
    options: [
      "Configure billing export to BigQuery. Create a Google Cloud budget for each project. Create a group for the developers in each project, and add them to the appropriate group. Create a notification channel for each group. Configure a billing alert to notify the group when their budget is exceeded. Modify the build scripts/pipeline to label all resources with the label “creator” set to the developer’s email address. Use spot (preemptible) instances wherever possible",
      "Configure billing export to BigQuery. Create a Google Cloud budget for each project. Configure a billing alert to notify billing admins and users when their budget is exceeded. Modify the build scripts/pipeline to label all resources with the label “creator” set to the developer’s email address. Use spot (preemptible) instances wherever possible",
      "Configure billing export to BigQuery. Create a Google Cloud budget for each project. Create a Pub/Sub topic for developer-budget-notifications. Create a Cloud Function to notify the developer based on the labels. Modify the build scripts/pipeline to label all resources with the label “creator” set to the developer’s email address. Use spot (preemptible) instances wherever possible",
      "Configure billing export to BigQuery. Create a Google Cloud budget for each project. Create a Pub/Sub topic for developer-budget-notifications. Create a Cloud Function to notify the developer based on the labels. Modify the build scripts/pipeline to label all resources with the label “creator” set to the developer’s email address. Use spot (preemptible) instances wherever possible. Use Cloud Scheduler to delete resources older than 24 hours in each project",
    ],
    answerIndex: 2,
    explanation:
      "Official answer: C. Configure billing export to BigQuery. Create a Google Cloud budget for each project. Create a Pub/Sub topic for developer-budget-notifications. Create a Cloud Function to notify the developer based on the labels. Modify the build scripts/pipeline to label all resources with the label “creator” set to the developer’s email address. Use spot (preemptible) instances wherever possible",
    serviceId: "pubsub",
  },
  {
    id: "off-w6-sec5-q4",
    domain: "Compute",
    section: "5–6 · Implementation & reliability",
    official: true,
    prompt:
      "Your client has adopted a multi-cloud strategy that uses a virtual machine-based infrastructure. The client's website serves users across the globe. The client needs a single dashboard view to monitor performance in their AWS and Google Cloud environments. Your client previously experienced an extended outage and wants to establish a monthly service level objective (SLO) of no outage longer than an hour.",
    options: [
      "In Cloud Monitoring, create an uptime check for the URL your clients will access. Configure it to check from multiple regions. Use the Cloud Monitoring dashboard to view the uptime metrics over time and ensure that the SLO is met. Recommend an SLO of 97% uptime per month",
      "In Cloud Monitoring, create an uptime check for the URL your clients will access. Configure it to check from multiple regions. Use the Cloud Monitoring dashboard to view the uptime metrics over time and ensure that the SLO is met. Recommend an SLO of 97% uptime per day",
      "Authorize access to your Google Cloud project from AWS with a service account. Install the monitoring agent on AWS EC2 (virtual machines) and Compute Engine instances. Use Cloud Monitoring to create dashboards that use the performance metrics from virtual machines to ensure that the SLO is met",
      "Create a new project to use as an AWS connector project. Authorize access to the project from AWS with a service account. Install the monitoring agent on AWS EC2 (virtual machines) and Compute Engine instances. Use Cloud Monitoring to create dashboards that use the performance metrics from virtual machines to ensure that the SLO is met",
    ],
    answerIndex: 1,
    explanation:
      "Official answer: B. In Cloud Monitoring, create an uptime check for the URL your clients will access. Configure it to check from multiple regions. Use the Cloud Monitoring dashboard to view the uptime metrics over time and ensure that the SLO is met. Recommend an SLO of 97% uptime per day",
    serviceId: "gce",
  },
  {
    id: "off-w6-sec5-q5",
    domain: "Data & AI",
    section: "5–6 · Implementation & reliability",
    official: true,
    prompt:
      "Cymbal Direct uses a proprietary service to manage on-call rotation and alerting. The on-call rotation service has an API for integration. Cymbal Direct wants to monitor its environment for service availability and ensure that the correct person is notified.",
    options: [
      "Ensure that VPC firewall rules allow access from the IP addresses used by Google Cloud’s uptime-check servers. Create a Pub/Sub topic for alerting as a monitoring notification channel in Google Cloud’s operations suite. Create an uptime check for the appropriate resource's internal IP address, with an alerting policy set to use the Pub/Sub topic. Create a Cloud Function that subscribes to the Pub/Sub topic to send the alert to the on-call API",
      "Ensure that VPC firewall rules allow access from the IP addresses used by Google Cloud's uptime-check servers. Create a Pub/Sub topic for alerting as a monitoring notification channel in Google Cloud’s operations suite. Create an uptime check for the appropriate resource's external IP address, with an alerting policy set to use the Pub/Sub topic. Create a Cloud Function that subscribes to the Pub/Sub topic to send the alert to the on-call API",
      "Ensure that VPC firewall rules allow access from the on-call API. Create a Cloud Function to send the alert to the on-call API. Add Cloud Functions as a monitoring notification channel in Google Cloud’s operations suite. Create an uptime check for the appropriate resource's external IP address, with an alerting policy set to use the Cloud Function",
      "Ensure that VPC firewall rules allow access from the IP addresses used by Google Cloud's uptime-check servers. Add the URL for the on-call rotation API as a monitoring notification channel in Google Cloud’s operations suite. Create an uptime check for the appropriate resource's internal IP address, with an alerting policy set to use the API",
    ],
    answerIndex: 1,
    explanation:
      "Official answer: B. Ensure that VPC firewall rules allow access from the IP addresses used by Google Cloud's uptime-check servers. Create a Pub/Sub topic for alerting as a monitoring notification channel in Google Cloud’s operations suite. Create an uptime check for the appropriate resource's external IP address, with an alerting policy set to use the Pub/Sub topic. Create a Cloud Function that subscribes to the Pub/Sub topic to send the alert to the on-call API",
    serviceId: "pubsub",
  },
  {
    id: "off-w6-sec5-q6",
    domain: "Operations",
    section: "5–6 · Implementation & reliability",
    official: true,
    prompt:
      "Cymbal Direct releases new versions of its drone delivery software every 1.5 to 2 months. Although most releases are successful, you have experienced three problematic releases that made drone delivery unavailable while software developers rolled back the release. You want to increase the reliability of software releases and prevent similar problems in the future.",
    options: [
      "Adopt a “waterfall” development process. Maintain the current release schedule. Ensure that documentation explains how all the features interact. Ensure that the entire application is tested in a staging environment before the release. Ensure that the process to roll back the release is documented. Use Cloud Monitoring, Cloud Logging, and Cloud Alerting to ensure visibility",
      "Adopt a “waterfall” development process. Maintain the current release schedule. Ensure that documentation explains how all the features interact. Automate testing of the application. Ensure that the process to roll back the release is well documented. Use Cloud Monitoring, Cloud Logging, and Cloud Alerting to ensure visibility",
      "Adopt an “agile” development process. Maintain the current release schedule. Automate build processes from a source repository. Automate testing after the build process. Use Cloud Monitoring, Cloud Logging, and Cloud Alerting to ensure visibility. Deploy the previous version if problems are detected and you need to roll back",
      "Adopt an “agile” development process. Reduce the time between releases as much as possible. Automate the build process from a source repository, which includes versioning and self-testing. Use Cloud Monitoring, Cloud Logging, and Cloud Alerting to ensure visibility. Use a canary deployment to detect issues that could cause rollback",
    ],
    answerIndex: 3,
    explanation:
      "Official answer: D. Adopt an “agile” development process. Reduce the time between releases as much as possible. Automate the build process from a source repository, which includes versioning and self-testing. Use Cloud Monitoring, Cloud Logging, and Cloud Alerting to ensure visibility. Use a canary deployment to detect issues that could cause rollback",
    serviceId: "cloud-monitoring",
  },
  {
    id: "off-w6-sec5-q7",
    domain: "Compute",
    section: "5–6 · Implementation & reliability",
    official: true,
    prompt:
      "Cymbal Direct’s warehouse and inventory system was written in Java. The system uses a microservices architecture in GKE and is instrumented with Zipkin. Seemingly at random, a request will be 5-10 times slower than others. The development team tried to reproduce the problem in testing, but failed to determine the cause of the issue.",
    options: [
      "Create metrics in Cloud Monitoring for your microservices to test whether they are intermittently unavailable or slow to respond to HTTPS requests. Use Cloud Profiler to determine which functions/methods in your application’s code use the most system resources. Use Cloud Trace to identify slow requests and determine which microservices/calls take the most time to respond",
      "Create metrics in Cloud Monitoring for your microservices to test whether they are intermittently unavailable or slow to respond to HTTPS requests. Use Cloud Trace to determine which functions/methods in your application’s code use the most system resources. Use Cloud Profiler to identify slow requests a nd determine which microservices/calls take the most time to respond",
      "Use Error Reporting to test whether your microservices are intermittently unavailable or slow to respond to HTTPS requests. Use Cloud Profiler to determine which functions/methods in your application’s code use the most system resources. Use Cloud Trace to identify slow requests and determine which microservices/calls take the most time to respond",
      "Use Error Reporting to test whether your microservices are intermittently unavailable or slow to respond to HTTPS requests. Use Cloud Trace to determine which functions/methods in your application’s code Use the most system resources. Use Cloud Profiler to identify slow requests and determine which microservices/calls take the most time to respond",
    ],
    answerIndex: 0,
    explanation:
      "Official answer: A. Create metrics in Cloud Monitoring for your microservices to test whether they are intermittently unavailable or slow to respond to HTTPS requests. Use Cloud Profiler to determine which functions/methods in your application’s code use the most system resources. Use Cloud Trace to identify slow requests and determine which microservices/calls take the most time to respond",
    serviceId: "gke",
  },
  {
    id: "off-w6-sec5-q8",
    domain: "Compute",
    section: "5–6 · Implementation & reliability",
    official: true,
    prompt:
      "You are using Cloud Run to deploy a Flask web application named app.py written in Python. In your testing and staging environments, the application performed as expected. When the application was deployed to production, product search results displayed products that should have been filtered out based on the user's preferences. The developer believes this performance issue would result from the 'user.productFilter' variable either not being set or not being evaluated correctly. You want visibility into what is happening, but also want to minimize user impact, because this is not a critical bug.",
    options: [
      "Use ssh to connect to the Compute Engine instance where Cloud Run is running. Run the command 'python3 -m pdb app.py' to debug the application",
      "Use ssh to connect to the Compute Engine instance where Cloud Run is running. Use the command 'pip install google-python-cloud-debugger' to install Cloud Debugger. Use the 'gcloud debug' command to debug the application",
      "Modify the Dockerfile for the Cloud Run application. Change the RUN command to 'python3 -m pdb /app.py'. Modify the script to import pdb. Deploy to Cloud Run as a canary build",
      "Modify the Dockerfile for the Cloud Run application. Add 'RUN ' pip install google-python-cloud-debugger ' to the Dockerfile. Modify the script to import googleclouddebugger. Use ' gcloud debug' to debug the application",
    ],
    answerIndex: 3,
    explanation:
      "Official answer: D. Modify the Dockerfile for the Cloud Run application. Add 'RUN ' pip install google-python-cloud-debugger ' to the Dockerfile. Modify the script to import googleclouddebugger. Use ' gcloud debug' to debug the application",
    serviceId: "cloud-run",
  },
  {
    id: "off-w6-sec5-q9",
    domain: "Compute",
    section: "5–6 · Implementation & reliability",
    official: true,
    prompt:
      "Cymbal Direct has a new social media integration service that pulls images of its products from social media sites and displays them in a gallery of customer images on your online store. You receive an alert from Cloud Monitoring at 3:34 AM on Saturday. The store is still online, but the gallery does not appear. The CPU utilization is 30% higher than expected on the VMs running the service, which causes the managed instance group (MIG) to scale to the maximum number of instances. You verify that the issue is real by checking the site and by checking the incidents timeline. What should you do to resolve the issue?",
    options: [
      "Increase the maximum number of instances in the MIG and verify that this resolves the issue. Ensure that the ticket is annotated with your solution. Create a normal work ticket for the application developer with a link to the incident. Mark the incident as closed",
      "Check the incident documentation or labels to determine the on-call contact. Appoint an incident commander, and open a chat channel, or conference call for emergency response. Investigate and resolve the issue by increasing the maximum number of instances in the MIG, and verify that this resolves the issue. Mark the incident as closed",
      "Increase the maximum number of instances in the MIG and verify that this resolves the issue. Check the incident documentation or labels to determine the on-call contact. Appoint an incident commander, and open a chat channel, or conference call for emergency response. Investigate and resolve the root cause of the issue. Write a blameless post-mortem and identify steps to prevent the issue, to ensure a culture of continuous improvement",
      "Verify the high CPU is not user impacting, increase the maximum number of instances in the MIG and verify that this resolves the issue",
    ],
    answerIndex: 3,
    explanation:
      "Official answer: D. Verify the high CPU is not user impacting, increase the maximum number of instances in the MIG and verify that this resolves the issue",
    serviceId: "gce",
  },
  {
    id: "off-w6-sec5-q10",
    domain: "Operations",
    section: "5–6 · Implementation & reliability",
    official: true,
    prompt:
      "You need to adopt Site Reliability Engineering principles and increase visibility into your environment. You want to minimize management overhead and reduce noise generated by the information being collected. You also want to streamline the process of reacting to analyzing and improving your environment, and to ensure that only trusted container images are deployed to production",
    options: [
      "Adopt Google Cloud’s operations suite to gain visibility into the environment. Use Cloud Trace for distributed tracing, Cloud Logging for logging, and Cloud Monitoring for monitoring, alerting, and dashboards. Only page the on-call contact about novel issues or events that haven’t been seen before. Use GNU Privacy Guard (GPG) to check container image signatures and ensure that only signed containers are deployed",
      "Adopt Google Cloud’s operations suite to gain visibility into the environment. Use Cloud Trace for distributed tracing, Cloud Logging for logging, and Cloud Monitoring for monitoring, alerting, and dashboards. Page the on-call contact when issues that affect resources in the environment are detected. Use GPG to check container image signatures and ensure that only signed containers are deployed",
      "Adopt Google Cloud’s operations suite to gain visibility into the environment. Use Cloud Trace for distributed tracing, Cloud Logging for logging, and Cloud Monitoring for monitoring, alerting, and dashboards. Only page the on-call contact about novel issues that violate a SLO or events that haven’t been seen before. Use Binary Authorization to ensure that only signed container images are deployed",
      "Adopt Google Cloud’s operations suite to gain visibility into the environment. Use Cloud Trace for distributed tracing, Cloud Logging for logging, and Cloud Monitoring for monitoring, alerting, and dashboards. Page the on-call contact when issues that affect resources in the environment are detected. Use Binary Authorization to ensure that only signed container images are deployed",
    ],
    answerIndex: 2,
    explanation:
      "Official answer: C. Adopt Google Cloud’s operations suite to gain visibility into the environment. Use Cloud Trace for distributed tracing, Cloud Logging for logging, and Cloud Monitoring for monitoring, alerting, and dashboards. Only page the on-call contact about novel issues that violate a SLO or events that haven’t been seen before. Use Binary Authorization to ensure that only signed container images are deployed",
    serviceId: "cloud-monitoring",
  },
  {
    id: "off-w6-cs-knightmotives-q1",
    domain: "General",
    section: "5–6 · Implementation & reliability",
    caseStudy: "knightmotives",
    official: true,
    prompt:
      "KnightMotives wants to create a consistent in-vehicle user experience across all its models, including BEV, hybrid, and ICE vehicles. The platform needs to support AI-powered features and be easily updatable. Which technology should they adopt as the foundation for their new in-vehicle system?",
    options: [
      "A custom Linux-based OS",
      "Android Automotive OS",
      "A proprietary real-time operating system (RTOS)",
      "A web-based application running on an in-vehicle browser",
    ],
    answerIndex: 1,
    explanation:
      "Official answer: B. Android Automotive OS",
  },
  {
    id: "off-w6-cs-knightmotives-q2",
    domain: "Security",
    section: "5–6 · Implementation & reliability",
    caseStudy: "knightmotives",
    official: true,
    prompt:
      "KnightMotives has experienced past data breaches and must adhere to strict EU data protection regulations. They need a centralized tool to manage security policies and detect potential vulnerabilities across their GCP environment. Which GCP service should they use?",
    options: [
      "Cloud Armor",
      "Cloud Identity and Access Management (IAM)",
      "Security Command Center",
      "Cloud Key Management Service (KMS)",
    ],
    answerIndex: 2,
    explanation:
      "Official answer: C. Security Command Center",
    serviceId: "iam",
  },
  {
    id: "off-w6-cs-knightmotives-q3",
    domain: "Networking",
    section: "5–6 · Implementation & reliability",
    caseStudy: "knightmotives",
    official: true,
    prompt:
      "KnightMotives plans to develop a chatbot to improve the customer service experience. This chatbot should be able to handle natural language queries related to sales, service, and vehicle features. Which GCP service should be used to build this conversational AI?",
    options: [
      "Conversational AI",
      "Cloud Natural Language API",
      "Cloud Translation API",
      "AutoML Tables",
    ],
    answerIndex: 0,
    explanation:
      "Official answer: A. Conversational AI",
    serviceId: "cloud-nat",
  },
  {
    id: "off-w6-cs-knightmotives-q4",
    domain: "Compute",
    section: "5–6 · Implementation & reliability",
    caseStudy: "knightmotives",
    official: true,
    prompt:
      "KnightMotives's dealers have no budget for new equipment, but they need modern tools to be successful. The solution for new dealer tools must be accessible without requiring any local hardware installation or upgrades. How should KnightMotives deploy these new tools?",
    options: [
      "As a desktop application that dealers must install",
      "As a mobile app for iOS and Android",
      "As a web application hosted on Cloud Run",
      "As a thick client application running on-premises at the dealerships",
    ],
    answerIndex: 3,
    explanation:
      "Official answer: D. As a thick client application running on-premises at the dealerships",
    serviceId: "cloud-run",
  },
];
