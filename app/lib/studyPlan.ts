// The official 6-week PCA study plan, mirroring the Google "Preparing for your
// PCA" cohort (one module per week). Each week is a checklist that deep-links
// into the app's quiz sections, case studies, flashcard decks and the map, so
// the plan orchestrates the features rather than duplicating their content.
//
// `section` values MUST match QuizQuestion.section; `caseStudy` values match
// CaseStudy.id; `deck` values match a FLASHCARD_DECKS entry; `topics` are
// serviceIds in SERVICE_INDEX.

export type StudyAction =
  | { type: "quiz"; section: string }
  | { type: "caseStudy"; caseStudy: string }
  | { type: "flashcards"; deck?: string }
  | { type: "map" };

export interface StudyTask {
  id: string;
  label: string;
  /** Optional deep-link. Omit for a plain check-off item. */
  action?: StudyAction;
}

export interface StudyWeek {
  week: number;
  module: string;
  title: string;
  focus: string;
  /** serviceIds surfaced as chips that jump to the map. */
  topics: string[];
  tasks: StudyTask[];
}

export const STUDY_PLAN: StudyWeek[] = [
  {
    week: 1,
    module: "Module 0",
    title: "Foundations & Exam Orientation",
    focus:
      "Get oriented: the exam scope and format, the four case studies, and the foundational concepts everything else builds on.",
    topics: ["iam", "storage-chooser", "vpc"],
    tasks: [
      {
        id: "w1-scope",
        label:
          "Understand the PCA exam scope, format, question style and scoring.",
      },
      {
        id: "w1-concepts",
        label:
          "Review foundational concepts: Opex vs Capex, SQL vs NoSQL, OLTP vs OLAP, the resource hierarchy, and Cloud Identity vs IAM.",
      },
      {
        id: "w1-iam-cards",
        label: "Drill the IAM & Cloud Identity study cards.",
        action: { type: "flashcards", deck: "IAM & Cloud Identity" },
      },
      {
        id: "w1-cases",
        label:
          "Skim all four official case studies so their context is familiar.",
        action: { type: "caseStudy", caseStudy: "ehr" },
      },
      {
        id: "w1-account",
        label: "Set up a GCP Free Trial / Free Tier account to practice hands-on.",
      },
    ],
  },
  {
    week: 2,
    module: "Module 1",
    title: "Designing & Planning a Cloud Solution",
    focus:
      "Compute options, managed instance groups, and the full private-connectivity toolkit — plus how to choose a data-processing service.",
    topics: [
      "gce",
      "gke",
      "cloud-run",
      "vpc-sc",
      "vpc-connectivity",
      "dataflow",
      "dataproc",
    ],
    tasks: [
      {
        id: "w2-compute",
        label:
          "Deep-dive Compute Engine: machine families, MIGs & autoscaling, Spot and Sole-tenant nodes.",      },
      {
        id: "w2-connectivity",
        label:
          "Learn private connectivity: Private Google Access, Private Service Access, Private Service Connect, Serverless VPC Access, and VPC Service Controls.",
      },
      {
        id: "w2-net-cards",
        label: "Drill the Networking basics study cards.",
        action: { type: "flashcards", deck: "Networking basics" },
      },
      {
        id: "w2-dataflow",
        label: "Compare Dataflow vs Dataproc and know when to pick each.",      },
      {
        id: "w2-quiz",
        label: "Take the Section 1 diagnostic quiz (10 questions).",
        action: { type: "quiz", section: "1 · Designing & planning" },
      },
      { id: "w2-lab", label: "Complete the Week 2 lab (Google Cloud Skills Boost)." },
    ],
  },
  {
    week: 3,
    module: "Module 2",
    title: "Managing & Provisioning Infrastructure",
    focus:
      "Cloud Storage classes & encryption, Cloud SQL high availability / DR, and organization policies — then apply them to EHR Healthcare.",
    topics: ["cloud-storage", "cloud-sql", "iac", "vpc"],
    tasks: [
      {
        id: "w3-gcs",
        label:
          "Know Cloud Storage cold: location & storage classes, Autoclass, lifecycle, CSEK/CMEK, and org-policy constraints.",      },
      {
        id: "w3-sql",
        label:
          "Master Cloud SQL: HA, read replicas, cross-region DR, point-in-time recovery, and DMS migration.",      },
      {
        id: "w3-quiz",
        label: "Take the Section 2 diagnostic quiz (10 questions).",
        action: { type: "quiz", section: "2 · Managing & provisioning" },
      },
      {
        id: "w3-case",
        label:
          "Study the EHR Healthcare case study, its proposed solution, and practice its questions.",
        action: { type: "caseStudy", caseStudy: "ehr" },
      },
      { id: "w3-lab", label: "Complete the Week 3 lab (Google Cloud Skills Boost)." },
    ],
  },
  {
    week: 4,
    module: "Module 3",
    title: "Designing for Security & Compliance",
    focus:
      "Zero Trust, PCI-DSS mapping, the GKE deep-dive, Cloud Run, and an intro to generative AI on Vertex AI — applied to Altostrat Media.",
    topics: [
      "iam",
      "cloud-iap",
      "vpc-sc",
      "cloud-kms",
      "gke",
      "cloud-run",
      "vertex-ai",
      "compliance-mapping",
    ],
    tasks: [
      {
        id: "w4-security",
        label:
          "Study Zero Trust, least privilege, and mapping a compliance regime (e.g. PCI-DSS) onto GCP controls.",      },
      {
        id: "w4-gke",
        label:
          "Deep-dive GKE: Autopilot, Workload Identity, private clusters, the 4 scaling dimensions, and Cloud Run vs GKE.",      },
      {
        id: "w4-genai",
        label:
          "Get the generative-AI landscape: Vertex AI, Gemini models, and AI agents.",      },
      {
        id: "w4-quiz",
        label: "Take the Section 3 diagnostic quiz (10 questions).",
        action: { type: "quiz", section: "3 · Security & compliance" },
      },
      {
        id: "w4-case",
        label:
          "Study the Altostrat Media case study, its proposed solution, and practice its questions.",
        action: { type: "caseStudy", caseStudy: "altostrat" },
      },
      { id: "w4-lab", label: "Complete the Week 4 lab (Google Cloud Skills Boost)." },
    ],
  },
  {
    week: 5,
    module: "Module 4",
    title: "Analyzing & Optimizing Processes",
    focus:
      "AI risks & MLOps, CI/CD, and the database deep-dives (Firestore, Spanner, BigQuery, Bigtable) with the storage selection matrix — for Cymbal Retail.",
    topics: [
      "vertex-ai",
      "cloud-build",
      "firestore",
      "spanner",
      "bigquery",
      "bigtable",
      "storage-chooser",
    ],
    tasks: [
      {
        id: "w5-mlops",
        label:
          "Understand AI risks (SAIF, Model Armor) and the MLOps lifecycle; modernize CI/CD (Artifact Registry vs Container Registry).",      },
      {
        id: "w5-db",
        label:
          "Compare the databases: Firestore modes, Spanner fit, BigQuery partitioning vs clustering, Bigtable — and the storage selection matrix.",      },
      {
        id: "w5-quiz",
        label: "Take the Section 4 diagnostic quiz (10 questions).",
        action: { type: "quiz", section: "4 · Analyzing & optimizing" },
      },
      {
        id: "w5-case",
        label:
          "Study the Cymbal Retail case study, its proposed solution, and practice its questions.",
        action: { type: "caseStudy", caseStudy: "cymbal" },
      },
      { id: "w5-lab", label: "Complete the Week 5 lab (Google Cloud Skills Boost)." },
    ],
  },
  {
    week: 6,
    module: "Module 5 & 6",
    title: "Implementation & Operations Reliability",
    focus:
      "Infrastructure as code, cost & HA/DR patterns, 'where should I run my stuff?', plus exam tips — then KnightMotives and a full study-card review.",
    topics: [
      "iac",
      "cost-optimization",
      "ha-patterns",
      "dr-strategy",
      "cloud-monitoring",
      "compute-chooser",
    ],
    tasks: [
      {
        id: "w6-impl",
        label:
          "Review IaC (Terraform vs Deployment Manager), the cost-optimization matrix, and HA/DR patterns per service.",      },
      {
        id: "w6-cards",
        label: "Drill all six PCA study-card decks.",
        action: { type: "flashcards" },
      },
      {
        id: "w6-quiz",
        label: "Take the Section 5–6 diagnostic quiz (10 questions).",
        action: { type: "quiz", section: "5–6 · Implementation & reliability" },
      },
      {
        id: "w6-case",
        label:
          "Study the KnightMotives Automotive case study, its proposed solution, and practice its questions.",
        action: { type: "caseStudy", caseStudy: "knightmotives" },
      },
      {
        id: "w6-tips",
        label:
          "Review the exam tips & tricks and the useful gcloud commands cheat-sheet.",
      },
      {
        id: "w6-ready",
        label: "Do a final readiness self-check — then schedule the exam. 🎯",
      },
    ],
  },
];

export const TOTAL_TASKS = STUDY_PLAN.reduce(
  (n, w) => n + w.tasks.length,
  0,
);
