// The 6 official PCA exam domains and their weightings, plus a mapping of
// each service/guide to the domain(s) it supports. Used by the readiness
// dashboard to estimate an exam-weighted "how ready am I?" score.

import type { Confidence } from "./curriculum";
import { SERVICE_INDEX } from "./curriculum";

export interface ExamDomain {
  id: string;
  /** Section number as it appears in the exam guide. */
  section: number;
  name: string;
  /** Percentage of the exam (all six sum to 100). */
  weight: number;
  blurb: string;
}

export const EXAM_DOMAINS: ExamDomain[] = [
  {
    id: "d1",
    section: 1,
    name: "Designing & planning a cloud solution architecture",
    weight: 25,
    blurb:
      "Business & technical requirements, HA/DR, choosing compute/storage/network/data solutions, and migration planning.",
  },
  {
    id: "d2",
    section: 2,
    name: "Managing & provisioning a cloud solution infrastructure",
    weight: 17.5,
    blurb:
      "Configuring network topologies, storage systems and compute; hybrid/multicloud; provisioning ML/AI infrastructure.",
  },
  {
    id: "d3",
    section: 3,
    name: "Designing for security & compliance",
    weight: 17.5,
    blurb:
      "IAM, resource hierarchy, encryption/KMS, secrets, VPC Service Controls, secure access, audits & regulation.",
  },
  {
    id: "d4",
    section: 4,
    name: "Analyzing & optimizing technical & business processes",
    weight: 15,
    blurb:
      "SDLC, CI/CD, troubleshooting/RCA, testing, disaster recovery, cost/resource optimization, business continuity.",
  },
  {
    id: "d5",
    section: 5,
    name: "Managing implementation",
    weight: 12.5,
    blurb:
      "Advising dev/ops on deployment, API management, migration tooling, IaC, and programmatic access (gcloud/SDKs).",
  },
  {
    id: "d6",
    section: 6,
    name: "Ensuring solution & operations excellence",
    weight: 12.5,
    blurb:
      "Operational-excellence pillar, observability (monitoring/logging/alerting), release management, reliability (SRE).",
  },
];

// serviceId -> domain ids it supports. A service can back multiple domains.
export const SERVICE_DOMAINS: Record<string, string[]> = {
  // Compute
  gce: ["d1", "d2"],
  gke: ["d1", "d2"],
  "cloud-run": ["d1", "d2"],
  "cloud-functions": ["d1", "d2"],
  "app-engine": ["d1", "d2"],
  // Storage & Databases
  "cloud-sql": ["d1", "d2"],
  spanner: ["d1", "d2"],
  bigtable: ["d1", "d2"],
  bigquery: ["d1", "d2"],
  firestore: ["d1", "d2"],
  "cloud-storage": ["d1", "d2"],
  memorystore: ["d1", "d2"],
  // Networking
  vpc: ["d1", "d2"],
  "cloud-lb": ["d1", "d2"],
  "cloud-cdn": ["d1", "d2"],
  "cloud-dns": ["d2"],
  "cloud-interconnect": ["d1", "d2"],
  "cloud-nat": ["d2"],
  // Security
  iam: ["d3"],
  "vpc-sc": ["d3"],
  "cloud-kms": ["d3"],
  "secret-manager": ["d3"],
  "cloud-armor": ["d2", "d3"],
  "cloud-iap": ["d3"],
  // Management & Ops
  "cloud-monitoring": ["d6"],
  "cloud-logging": ["d3", "d6"],
  "cloud-build": ["d4", "d5"],
  "cloud-deploy": ["d4", "d5", "d6"],
  iac: ["d2", "d5"],
  dms: ["d1", "d5"],
  // Data & AI
  pubsub: ["d1", "d2"],
  dataflow: ["d1", "d2"],
  dataproc: ["d1", "d2"],
  looker: ["d1", "d4"],
  "vertex-ai": ["d1", "d2"],
  "ai-apis": ["d1", "d2"],
  composer: ["d2", "d5"],
  datafusion: ["d1", "d2"],
  // Decision guides
  "hybrid-connectivity": ["d1", "d2"],
  "vpc-connectivity": ["d1", "d2"],
  "migration-path": ["d1", "d5"],
  "dr-strategy": ["d1", "d4"],
  "cost-optimization": ["d1", "d4"],
  "ha-patterns": ["d1", "d6"],
  "compute-chooser": ["d1", "d2"],
  "lb-chooser": ["d1", "d2"],
  "data-processing-chooser": ["d1", "d2"],
  "storage-chooser": ["d1", "d2"],
  "compliance-mapping": ["d3"],
};

export function domainsForService(serviceId: string): string[] {
  return SERVICE_DOMAINS[serviceId] ?? [];
}

// domainId -> service ids mapped to it.
export const servicesForDomain: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};
  for (const d of EXAM_DOMAINS) map[d.id] = [];
  for (const [sid, domains] of Object.entries(SERVICE_DOMAINS)) {
    for (const d of domains) map[d]?.push(sid);
  }
  return map;
})();

/** Confidence → readiness weight. Mastered = full, reviewing = half. */
function confidenceScore(c: Confidence | undefined): number {
  if (c === "mastered") return 1;
  if (c === "reviewing") return 0.5;
  return 0; // weak or untracked
}

export interface DomainReadiness {
  domain: ExamDomain;
  /** 0–100. */
  readiness: number;
  counts: { mastered: number; reviewing: number; weak: number; untracked: number };
  serviceIds: string[];
}

export interface ReadinessReport {
  /** Exam-weighted overall readiness, 0–100. */
  overall: number;
  perDomain: DomainReadiness[];
}

export function computeReadiness(
  confidence: Record<string, Confidence>,
): ReadinessReport {
  const perDomain: DomainReadiness[] = EXAM_DOMAINS.map((domain) => {
    const serviceIds = servicesForDomain[domain.id].filter(
      (id) => SERVICE_INDEX[id],
    );
    const counts = { mastered: 0, reviewing: 0, weak: 0, untracked: 0 };
    let sum = 0;
    for (const id of serviceIds) {
      const c = confidence[id];
      if (c === "mastered") counts.mastered++;
      else if (c === "reviewing") counts.reviewing++;
      else if (c === "weak") counts.weak++;
      else counts.untracked++;
      sum += confidenceScore(c);
    }
    const readiness = serviceIds.length
      ? (sum / serviceIds.length) * 100
      : 0;
    return { domain, readiness, counts, serviceIds };
  });

  const overall = perDomain.reduce(
    (acc, d) => acc + (d.domain.weight / 100) * d.readiness,
    0,
  );

  return { overall, perDomain };
}
