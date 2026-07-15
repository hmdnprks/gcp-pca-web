// Exam tips & tricks and a gcloud/bq cheat-sheet, transcribed from the
// "Exam tips&tricks" and "Useful gcloud commands" slides of the official
// Google "Preparing for your PCA" training deck (Module 5 & 6).

export interface TipGroup {
  heading: string;
  tips: string[];
}

export interface GcloudGroup {
  heading: string;
  commands: { label: string; cmd: string }[];
}

export const EXAM_TIPS: TipGroup[] = [
  {
    heading: "Exam strategy",
    tips: [
      "READ every question at least twice — look for key statements; details matter.",
      "There is no fixed, public pass score (people estimate ~70%). Don't overthink the math, and don't let a few hard questions in a row rattle you.",
    ],
  },
  {
    heading: "Compute & GKE",
    tips: [
      "Boot a Docker container faster by using the Alpine slim Linux distro.",
      "Maximize GKE / Kubernetes knowledge — expect questions on deployments, GKE-related gcloud commands, and container use-cases.",
      "Update a deployed MIG with the “rolling-action start-update” feature (supports canary updates). A NEW instance template is required — you can't edit an existing VM template.",
      "Persistent Disk encryption: HDDs use AES-128, SSDs use AES-256.",
      "Common PD snapshot uses: upgrade/downgrade disk type, migrate to other zones, reduce disk size, or convert to images (usable in other projects/regions). To share a snapshot across projects, create it directly from the destination project.",
      "Move a VM to another zone with `gcloud compute instances move`, or snapshot the disk → restore it in the new zone → create a VM and reattach the disk → reassign a static IP if needed.",
      "Query metadata from inside a VM via the metadata server at 169.254.169.254 with header `Metadata-Flavor: Google`.",
      "Standard FQDN of a GCP VM: hostname.zone.c.project-id.internal.",
    ],
  },
  {
    heading: "Storage & data",
    tips: [
      "Analytics + SQL = BigQuery. Make sure you understand table partitioning vs clustering.",
      "GCS and Spanner are multi-regional for data sync.",
      "Datastore / Firestore is a great backend for App Engine and for storing game state.",
      "Firestore: schemaless documents (key/value pairs) grouped into collections; global scale for mobile/web/IoT; supports ACID transactions; backwards-compatible with Datastore (it's the next generation).",
      "GCS public ACL scopes: allUsers (anyone, even without a Google account) vs allAuthenticatedUsers (anyone authenticated with a Google account).",
      "Pub/Sub: messages up to 10 MB; undelivered messages stored up to 7 days; “at least once” delivery — for “exactly once”, stream through Dataflow.",
      "Simple back-out / roll-out plan: enable object versioning on GCS static site files, and use managed instance groups with rolling updates.",
    ],
  },
  {
    heading: "Networking",
    tips: [
      "Cloud VPN is a regional service, max 3 Gbps (can be aggregated), supports IKEv1 & IKEv2, with a max & recommended MTU of 1460.",
      "Partner Interconnect: up to 10 Gbps. Dedicated Interconnect: 10G to 100G (or multiples).",
      "Global Load Balancing and Cloud CDN require the Premium network tier.",
      "Global load balancers support IPv6 at the proxy (the 2nd session inside GCP still uses IPv4); the HTTPS LB natively supports WebSockets.",
      "An auto-mode network can be converted to custom mode, but a custom-mode network cannot be converted back to auto.",
      "A subnet CIDR reserves 4 unusable IPs (network, gateway, second-to-last, broadcast) — matters when sizing small subnets.",
      "Firewall priority: the first matching rule is applied and no further rules are evaluated.",
    ],
  },
  {
    heading: "IAM & security",
    tips: [
      "Know the most popular IAM roles for each service — especially GCE, GCS, GKE and BigQuery.",
      "Custom roles can only be applied at the organization or project level — NOT folders.",
      "The Service Account User role lets a person use a VM's service account — so they can gain that SA's elevated privileges (e.g. deleting other VMs) if they can access the VM.",
      "IAP in one line: an API gateway that authenticates and authorizes HTTPS requests using IAM — for users logging into apps deployed on GCP (rather than accessing GCE/App Engine directly).",
      "Audit logs are kept for 30 days; export to Cloud Storage, BigQuery or Pub/Sub for longer retention.",
    ],
  },
  {
    heading: "Projects & billing",
    tips: [
      "GCP projects can be billed separately (different billing accounts).",
      "Each resource is zonal, regional, multi-regional or global — and must belong to a SINGLE project.",
    ],
  },
];

export const GCLOUD_CHEATSHEET: GcloudGroup[] = [
  {
    heading: "Networking",
    commands: [
      { label: "List networks", cmd: "gcloud compute networks list" },
      {
        label: "List subnets",
        cmd: "gcloud compute networks subnets list --sort-by=NETWORK",
      },
      {
        label: "List firewall rules",
        cmd: "gcloud compute firewall-rules list --sort-by=NETWORK",
      },
      {
        label: "Create a custom-mode network",
        cmd: "gcloud compute networks create privatenet --subnet-mode=custom",
      },
      {
        label: "Create a subnet",
        cmd: "gcloud compute networks subnets create privatesubnet-us --network=privatenet --region=us-central1 --range=172.16.0.0/24",
      },
      {
        label: "Create a firewall rule",
        cmd: "gcloud compute firewall-rules create FIREWALL_NAME --network privatenet --allow tcp,udp,icmp --source-ranges IP_RANGE",
      },
    ],
  },
  {
    heading: "Projects & IAM",
    commands: [
      {
        label: "Create a project",
        cmd: "gcloud projects create --name=NAME [--folder=FOLDER_ID] [--organization=ORGANIZATION_ID] [--set-as-default]",
      },
      {
        label: "Set the active project",
        cmd: "gcloud config set project PROJECT_ID",
      },
      { label: "Create a custom role", cmd: "gcloud iam roles create" },
      {
        label: "Bind a role to a user/SA/group",
        cmd: "gcloud projects add-iam-policy-binding PROJECT_ID --member=EMAIL --role=ROLE",
      },
    ],
  },
  {
    heading: "Deployment Manager",
    commands: [
      {
        label: "Create a deployment",
        cmd: "gcloud deployment-manager deployments create my-first-depl --config mydeploy.yaml",
      },
      {
        label: "Update a deployment",
        cmd: "gcloud deployment-manager deployments update my-first-depl --config mydeploy.yaml",
      },
    ],
  },
  {
    heading: "GKE",
    commands: [
      {
        label: "Create a cluster",
        cmd: "gcloud container clusters create MYCLUSTER --zone MY_ZONE --num-nodes 2",
      },
      {
        label: "Resize a cluster",
        cmd: "gcloud container clusters resize NAME --size=SIZE [--node-pool=NODE_POOL] [--zone=ZONE]",
      },
      {
        label: "Get cluster credentials",
        cmd: "gcloud container clusters get-credentials echo-cluster --zone=us-central1-a",
      },
    ],
  },
  {
    heading: "App Engine",
    commands: [
      {
        label: "Create the App Engine app",
        cmd: "gcloud app create --project=$DEVSHELL_PROJECT_ID",
      },
      { label: "Run the app locally", cmd: "dev_appserver.py $(pwd)" },
      {
        label: "Deploy the app",
        cmd: "gcloud app deploy YOUR_APP_MANIFEST.yaml",
      },
    ],
  },
  {
    heading: "BigQuery (bq)",
    commands: [
      {
        label: "Create a partitioned table that expires",
        cmd: "bq mk --time_partitioning_type=DAY --time_partitioning_expiration=259200 DATASET.TABLE",
      },
      {
        label: "Query a table",
        cmd: 'bq query "select * from mydataset.mytable"',
      },
      { label: "List jobs (all users)", cmd: "bq ls -j -a PROJECT" },
    ],
  },
  {
    heading: "Cloud Build",
    commands: [
      {
        label: "Build and store an image",
        cmd: "gcloud builds submit --tag gcr.io/$DEVSHELL_PROJECT_ID/devops-image:v0.1 .",
      },
      {
        label: "Build using a config file",
        cmd: "gcloud builds submit --config cloudbuild.yaml .",
      },
    ],
  },
];
