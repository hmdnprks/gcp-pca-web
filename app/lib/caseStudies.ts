// Official PCA case studies (v6.1, Oct 2025 exam refresh).
// Content is grounded in the official case-study PDFs. The per-service
// "Case Study Tags" shown in the detail panel are DERIVED from the
// `featured` lists below (single source of truth), so tags can never drift
// out of sync with the explorer.

import { SERVICE_INDEX } from "./curriculum";

export interface FeaturedService {
  /** id in SERVICE_INDEX. */
  serviceId: string;
  /** Why this case study features the service. */
  why: string;
}

export interface CaseStudy {
  id: string;
  name: string;
  industry: string;
  /** Lucide icon key handled locally in the explorer. */
  icon: string;
  accent: string;
  /** One-paragraph solution concept. */
  summary: string;
  businessReqs: string[];
  technicalReqs: string[];
  featured: FeaturedService[];
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "altostrat",
    name: "Altostrat Media",
    industry: "Media & Entertainment",
    icon: "altostrat",
    accent: "violet",
    summary:
      "A media company with a huge audio/video library (podcasts, interviews, news, documentaries) modernizing content management and engagement with generative AI — personalized recommendations, natural-language interaction, automated summarization, metadata extraction and content moderation.",
    businessReqs: [
      "Accelerate & improve reliability of operational workflows across Google Cloud + on-premises.",
      "Simplify infrastructure management for rapid deployment.",
      "Optimize cloud storage costs while keeping media highly available and scalable.",
      "Natural-language interaction with 24/7 user support.",
      "Auto-generate concise summaries and extract rich metadata (NLP + computer vision).",
      "Detect and filter inappropriate content; analyze content for trends & insights.",
    ],
    technicalReqs: [
      "Modernize CI/CD for containerized deployments with a centralized management platform.",
      "Secure, high-performance hybrid connectivity for data ingestion.",
      "Scalable, performant Kubernetes both on-premises and in the cloud.",
      "AI-powered harmful-content detection that is auditable and explainable.",
      "LLM / conversational AI for personalization and automated summarization.",
    ],
    featured: [
      { serviceId: "gke", why: "Runs the scalable, highly-available content platform — and must extend Kubernetes to on-premises too." },
      { serviceId: "cloud-storage", why: "Stores the vast media library; lifecycle tiers optimize growing storage costs." },
      { serviceId: "bigquery", why: "Primary data warehouse for user-behavior and content-consumption insights." },
      { serviceId: "cloud-functions", why: "Serverless, event-driven video transcoding, metadata extraction and recommendations." },
      { serviceId: "vertex-ai", why: "Gemini / LLMs for summarization, NLP & vision metadata, content moderation and chatbots — with explainable, auditable AI." },
      { serviceId: "cloud-interconnect", why: "Secure, high-performance hybrid connectivity for on-prem content ingestion." },
      { serviceId: "cloud-build", why: "Modernized CI/CD for containerized deployments." },
      { serviceId: "cloud-deploy", why: "Centralized release-management platform across on-prem + cloud." },
      { serviceId: "cloud-monitoring", why: "Consolidates native + Prometheus monitoring with better-than-email alerting." },
    ],
  },
  {
    id: "cymbal",
    name: "Cymbal Retail",
    industry: "Retail / E-commerce",
    icon: "cymbal",
    accent: "emerald",
    summary:
      "A fast-growing online retailer with a huge product catalog, modernizing with generative AI: automated catalog & content enrichment (attributes, descriptions, images), conversational commerce with product discovery, and a technical-stack modernization off legacy on-prem systems.",
    businessReqs: [
      "Automate product-catalog enrichment — cut manual effort, errors, keep info consistent across channels.",
      "Improve product discoverability and search relevance.",
      "Increase customer engagement with a personalized, conversational experience.",
      "Drive sales conversion and reduce call-center + data-center costs.",
    ],
    technicalReqs: [
      "GenAI attribute generation from supplier titles/descriptions/images.",
      "Product image generation & enhancement (variations, backgrounds, overlays).",
      "Natural-language product discovery returning highly relevant results.",
      "Scale to an extensive catalog; human-in-the-loop (HITL) review UI.",
      "Data security & compliance for customer PII and agent interactions.",
    ],
    featured: [
      { serviceId: "vertex-ai", why: "Gemini for catalog attributes/descriptions, Imagen for product images, and Vertex AI Search / Discovery AI for conversational product discovery." },
      { serviceId: "cloud-sql", why: "Managed home for the MySQL & SQL Server catalog databases after migration." },
      { serviceId: "memorystore", why: "Managed Redis replaces self-run caching." },
      { serviceId: "firestore", why: "Document store to modernize the MongoDB catalog/customer data." },
      { serviceId: "gke", why: "Runs the containerized applications after modernization." },
      { serviceId: "dms", why: "Near-zero-downtime migration of MySQL / SQL Server off the data center." },
      { serviceId: "datafusion", why: "Replaces brittle SFTP / ETL batch integrations with managed pipelines." },
      { serviceId: "cloud-monitoring", why: "Consolidates Grafana / Nagios / Elastic into proactive monitoring." },
      { serviceId: "vpc-sc", why: "Protects customer PII and meets data-security & compliance needs." },
      { serviceId: "cloud-armor", why: "Protects the public storefront web application." },
    ],
  },
  {
    id: "ehr",
    name: "EHR Healthcare",
    industry: "Healthcare SaaS",
    icon: "ehr",
    accent: "rose",
    summary:
      "A SaaS electronic-health-record provider growing exponentially and moving off expiring colocation facilities to Google Cloud — needing to scale, adapt disaster recovery, ship continuous deployments, stay compliant, and keep legacy on-prem insurer integrations connected.",
    businessReqs: [
      "Onboard new insurance providers quickly.",
      "Minimum 99.9% availability for all customer-facing systems.",
      "Centralized visibility & proactive action on performance and usage.",
      "Insights & predictions on healthcare trends from provider data.",
      "Reduce latency, maintain regulatory compliance, cut admin costs.",
    ],
    technicalReqs: [
      "Keep legacy insurer interfaces connected to both on-prem and cloud.",
      "Consistent management of container-based customer-facing apps.",
      "Secure, high-performance connection between on-prem and Google Cloud.",
      "Consistent logging, retention, monitoring and alerting.",
      "Manage multiple container environments; dynamically scale & provision.",
    ],
    featured: [
      { serviceId: "gke", why: "Consistent way to manage & scale the container-based apps across environments." },
      { serviceId: "cloud-sql", why: "Managed MySQL & SQL Server replacing self-managed relational DBs." },
      { serviceId: "memorystore", why: "Managed Redis." },
      { serviceId: "firestore", why: "Managed document DB replacing MongoDB." },
      { serviceId: "cloud-interconnect", why: "Secure, high-performance link between on-prem (legacy insurer interfaces) and Google Cloud." },
      { serviceId: "cloud-monitoring", why: "Centralized visibility & proactive alerting (vs. ignored email alerts)." },
      { serviceId: "cloud-logging", why: "Consistent logging, retention & audit for compliance." },
      { serviceId: "iam", why: "Integrate Microsoft Active Directory identities with least-privilege access." },
      { serviceId: "vpc-sc", why: "Data-exfiltration perimeter for HIPAA-regulated health records." },
      { serviceId: "cloud-kms", why: "CMEK encryption for regulatory compliance." },
      { serviceId: "cloud-lb", why: "99.9% availability and reduced latency for customer-facing systems." },
      { serviceId: "dms", why: "Migrate databases off the expiring colocation facility." },
      { serviceId: "bigquery", why: "Analyze provider data for healthcare-trend insights & reporting." },
      { serviceId: "vertex-ai", why: "Predictions & reports on industry trends from provider data." },
      { serviceId: "dataflow", why: "Ingest & process data from newly onboarded insurance providers." },
    ],
  },
  {
    id: "knightmotives",
    name: "KnightMotives Automotive",
    industry: "Automotive / Connected Car",
    icon: "knightmotives",
    accent: "sky",
    summary:
      "An automaker (BEV / hybrid / ICE, incl. autonomous vehicles) shifting from making cars to delivering an AI-powered 'automotive experience': connected-vehicle telemetry, in-vehicle AI, autonomous ML + simulation, data monetization, a reliable build-to-order system, and strict EU data protection after past breaches.",
    businessReqs: [
      "Personalized driver relationship; cohesive AI experience across all models.",
      "Reliable build-to-order model with transparency for dealers & customers.",
      "Monetize corporate/vehicle data to fund new technology.",
      "Paramount security (past breaches) and EU (GDPR) data protection / sovereignty.",
    ],
    technicalReqs: [
      "In-vehicle AI features + reliable connectivity (incl. rural areas).",
      "Network upgrades between plants and HQ; hybrid cloud strategy.",
      "Autonomous-vehicle AI/ML with a robust simulation environment.",
      "Data-monetization platform with strict security & scalable AI/ML.",
      "Comprehensive security framework, incident response, dealer/CRM tooling.",
    ],
    featured: [
      { serviceId: "bigtable", why: "Ingests & stores high-volume vehicle telemetry / time-series (sensors, location) at scale." },
      { serviceId: "pubsub", why: "Global ingestion pipeline for connected-vehicle event streams." },
      { serviceId: "dataflow", why: "Real-time stream processing of vehicle telemetry." },
      { serviceId: "bigquery", why: "Data platform for monetizing vehicle/corporate data and generating insights." },
      { serviceId: "vertex-ai", why: "AI/ML for autonomous driving, in-vehicle features and simulation (GPUs/TPUs / AI Hypercomputer)." },
      { serviceId: "spanner", why: "Globally-consistent, reliable backend for build-to-order ordering & CRM." },
      { serviceId: "cloud-interconnect", why: "Hybrid connectivity between manufacturing plants, HQ and the cloud." },
      { serviceId: "vpc-sc", why: "Enforces EU (GDPR) data protection & sovereignty and guards against breaches." },
      { serviceId: "iam", why: "Comprehensive least-privilege security framework after past data breaches." },
      { serviceId: "gce", why: "Path to modernize / replace the outdated mainframe & legacy systems." },
    ],
  },
];

export const CASE_STUDY_NAMES = CASE_STUDIES.map((c) => c.name);

/** Reverse index: serviceId -> [case study names that feature it]. */
export const caseStudiesForService: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};
  for (const cs of CASE_STUDIES) {
    for (const f of cs.featured) {
      (map[f.serviceId] ??= []).push(cs.name);
    }
  }
  return map;
})();

/** serviceId -> that service's featured entry per case study id (for tooltips). */
export function caseStudiesFor(serviceId: string): string[] {
  return caseStudiesForService[serviceId] ?? [];
}

// Warn in dev if a featured serviceId doesn't resolve (keeps data honest).
if (process.env.NODE_ENV !== "production") {
  for (const cs of CASE_STUDIES) {
    for (const f of cs.featured) {
      if (!SERVICE_INDEX[f.serviceId]) {
        // eslint-disable-next-line no-console
        console.warn(`[caseStudies] unknown serviceId "${f.serviceId}" in ${cs.name}`);
      }
    }
  }
}
