// Flashcards for active recall, authored from the official "PCA Study Cards"
// in the Google "Preparing for your PCA" training deck (Module 5 & 6, the
// condensed cheat-sheet slides). Each card is a front/back recall pair grouped
// into the six official study-card decks.

export interface Flashcard {
  id: string;
  /** Study-card deck this belongs to. */
  deck: string;
  /** Recall prompt (question / cue). */
  front: string;
  /** Answer — may contain multiple lines separated by "\n". */
  back: string;
  /** Optional link to a service in SERVICE_INDEX for "review this topic". */
  serviceId?: string;
}

export const FLASHCARD_DECKS = [
  "IAM & Cloud Identity",
  "Networking basics",
  "Shared VPC",
  "VPC Peering",
  "Connectivity",
  "Load Balancing",
] as const;

export const FLASHCARDS: Flashcard[] = [
  // ── IAM & Cloud Identity ────────────────────────────────────────────────
  {
    id: "fc-iam-sso-gcds",
    deck: "IAM & Cloud Identity",
    front: "How are SSO and Google Cloud Directory Sync (GCDS) related?",
    back: "They are mutually exclusive as mechanisms — though often used together. GCDS provisions users/groups from on-prem into Cloud Identity; SAML SSO (e.g. via ADFS) handles authentication.",
    serviceId: "iam",
  },
  {
    id: "fc-iam-hierarchy",
    deck: "IAM & Cloud Identity",
    front: "Where is the GCP resource hierarchy defined, and what is optional?",
    back: "In Resource Manager (Organization → Folders → Projects → Resources). The Organization is technically optional, and Folders are optional too (and can be nested).",
    serviceId: "iam",
  },
  {
    id: "fc-iam-levels",
    deck: "IAM & Cloud Identity",
    front: "At what levels can IAM permissions be assigned, and which is least privilege?",
    back: "Any level — organization, folder, project, or resource. Lower in the hierarchy is generally least privilege. Assigning at a higher level affects all current AND future resources.",
    serviceId: "iam",
  },
  {
    id: "fc-iam-role-types",
    deck: "IAM & Cloud Identity",
    front: "What are the three types of IAM roles?",
    back: "Basic/primitive (owner, editor, viewer — limited to non-prod/special cases), Predefined (most common), and Custom (limitations: not all permissions, limited number).",
    serviceId: "iam",
  },
  {
    id: "fc-iam-best-practices",
    deck: "IAM & Cloud Identity",
    front: "IAM best practices for granting access?",
    back: "Assign to groups rather than user accounts; assign at the lowest practical level; grant the fewest permissions needed to “get the job done”.",
    serviceId: "iam",
  },

  // ── Networking basics ───────────────────────────────────────────────────
  {
    id: "fc-net-vpc-scope",
    deck: "Networking basics",
    front: "What is the relationship between a VPC, project, and region?",
    back: "A VPC belongs to exactly 1 project and can be present in every region across GCP (it is by default). A subnet crosses zones within a region but cannot cross regional boundaries.",
    serviceId: "vpc",
  },
  {
    id: "fc-net-global-comms",
    deck: "Networking basics",
    front: "Do VMs in different regions of the same VPC need extra config to communicate?",
    back: "No. No additional configuration (VPNs or routers) is required — servers communicate globally within the VPC by default.",
    serviceId: "vpc",
  },
  {
    id: "fc-net-implied-rules",
    deck: "Networking basics",
    front: "What are the implied firewall rules (priority 65535)?",
    back: "Allow all egress traffic; Deny all ingress traffic.",
    serviceId: "vpc",
  },
  {
    id: "fc-net-default-rules",
    deck: "Networking basics",
    front: "What are the default firewall rules on the default network?",
    back: "Allow SSH, ICMP, and RDP; block SMTP traffic.",
    serviceId: "vpc",
  },
  {
    id: "fc-net-priority",
    deck: "Networking basics",
    front: "How does firewall rule priority work?",
    back: "Lower number = higher priority (1 beats 10). Priority ranges from 0 to 65535.",
    serviceId: "vpc",
  },
  {
    id: "fc-net-rule-components",
    deck: "Networking basics",
    front: "What are the components of a firewall rule?",
    back: "Direction (ingress/egress), Priority (0–65535), Action (allow/deny), Enforcement status, Target, Source, Protocol, and Log (on/off).",
    serviceId: "vpc",
  },

  // ── Shared VPC ──────────────────────────────────────────────────────────
  {
    id: "fc-shared-what",
    deck: "Shared VPC",
    front: "What is Shared VPC and why use it?",
    back: "The most common way to share networks: a host project shares subnet(s) with service projects. You get many projects (good for security/billing) without the overhead of managing many VPCs.",
    serviceId: "vpc",
  },
  {
    id: "fc-shared-security",
    deck: "Shared VPC",
    front: "How does Shared VPC improve security segmentation?",
    back: "Admins on compute nodes only need network *user* permissions — they don't administer network functions. Connectivity (VPN/interconnect) and firewall rules are centrally managed in the host project.",
    serviceId: "vpc",
  },
  {
    id: "fc-shared-org",
    deck: "Shared VPC",
    front: "What organizational constraint applies to Shared VPC?",
    back: "Host and service projects must belong to the same GCP organization.",
    serviceId: "vpc",
  },

  // ── VPC Peering ─────────────────────────────────────────────────────────
  {
    id: "fc-peer-transitive",
    deck: "VPC Peering",
    front: "Is VPC Peering transitive?",
    back: "No. Traffic will not route to other networks peered to your peer — if A↔B and B↔C, A still cannot reach C.",
    serviceId: "vpc-connectivity",
  },
  {
    id: "fc-peer-orgs",
    deck: "VPC Peering",
    front: "Does VPC Peering work across organizations, and who configures it?",
    back: "It works within AND between GCP organizations. Administrators on both sides must configure it, choosing which subnet(s) to publish routes to.",
    serviceId: "vpc-connectivity",
  },
  {
    id: "fc-peer-ip-perf",
    deck: "VPC Peering",
    front: "Peering: IP requirement and performance vs VPN?",
    back: "IP ranges cannot overlap. Links are high-throughput and very low latency (unlike connecting via a VPN).",
    serviceId: "vpc-connectivity",
  },
  {
    id: "fc-peer-products",
    deck: "VPC Peering",
    front: "Which GCP products require VPC Peering as part of their setup?",
    back: "Apigee X and Datastream both require peering as part of their configuration.",
    serviceId: "vpc-connectivity",
  },

  // ── Connectivity (hybrid) ───────────────────────────────────────────────
  {
    id: "fc-conn-speeds",
    deck: "Connectivity",
    front: "Max speeds: Cloud VPN vs Partner vs Dedicated Interconnect?",
    back: "VPN up to 3 Gbps, Partner Interconnect up to 50 Gbps, Dedicated Interconnect up to 100 Gbps. Solutions can be stacked for higher speeds.",
    serviceId: "hybrid-connectivity",
  },
  {
    id: "fc-conn-vpn",
    deck: "Connectivity",
    front: "How does Cloud VPN connectivity work?",
    back: "Always goes over the internet, encrypted with IPSec, using exchanged pre-shared keys — and requires a public IP address.",
    serviceId: "hybrid-connectivity",
  },
  {
    id: "fc-conn-interconnect-target",
    deck: "Connectivity",
    front: "Do Interconnects connect to GCP or to Google? What about Workspace?",
    back: "Both Direct and Partner Interconnect connect to GCP (your VPC), not Google's public services. Consumer services / Workspace still go over the internet.",
    serviceId: "hybrid-connectivity",
  },
  {
    id: "fc-conn-ha",
    deck: "Connectivity",
    front: "High-availability rule for connecting into GCP?",
    back: "Never have only 1 connection. Put connections in two separate regions (not zones). You can back up the primary with a different solution (e.g. primary Interconnect, VPN as backup). IP ranges must not overlap.",
    serviceId: "hybrid-connectivity",
  },

  // ── Load Balancing ──────────────────────────────────────────────────────
  {
    id: "fc-lb-external-http",
    deck: "Load Balancing",
    front: "Key properties of the External HTTP(S) Load Balancer?",
    back: "Global service (requires Premium network tier), routes traffic to the closest endpoint, uses a single Anycast IP, and can serve backends on-premises or in other clouds.",
    serviceId: "cloud-lb",
  },
  {
    id: "fc-lb-url-map",
    deck: "Load Balancing",
    front: "What does a URL Map do, and where does it apply?",
    back: "Directs traffic to different backends based on a URL fragment or host name. Applies to BOTH internal and external HTTP(S) load balancers.",
    serviceId: "cloud-lb",
  },
  {
    id: "fc-lb-armor",
    deck: "Load Balancing",
    front: "What does Cloud Armor do at the load balancer?",
    back: "Protects backends from OWASP Top 10 attacks (SQL injection, XSS). Supports allow/deny lists for IPs and regions; named IP lists are 3rd-party malicious-IP lists. Like firewall rules, lower number = higher priority.",
    serviceId: "cloud-armor",
  },
  {
    id: "fc-lb-remember",
    deck: "Load Balancing",
    front: "What else to remember when designing load balancing?",
    back: "Health checks on backends, firewall rules, and SSL Proxy (for non-HTTP traffic).",
    serviceId: "cloud-lb",
  },
];
