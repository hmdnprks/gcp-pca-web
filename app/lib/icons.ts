import {
  Activity,
  AppWindow,
  Archive,
  ArrowRightLeft,
  BarChart3,
  Blocks,
  BrainCircuit,
  Cable,
  CircleDot,
  Cloud,
  Combine,
  Container,
  Cpu,
  Database,
  DatabaseZap,
  FileCode2,
  Fingerprint,
  Globe,
  KeyRound,
  KeySquare,
  Layers,
  LineChart,
  Lock,
  Network,
  Radio,
  Rocket,
  Route,
  Router,
  ScrollText,
  Server,
  Settings2,
  Shield,
  ShieldCheck,
  ShieldHalf,
  Ship,
  Sparkles,
  Table2,
  Waypoints,
  Wind,
  Workflow,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Maps the string `icon` keys used in curriculum.ts to Lucide components.
// Any missing key falls back to CircleDot (see iconFor).
const ICONS: Record<string, LucideIcon> = {
  // Pillars
  compute: Cpu,
  storage: Database,
  networking: Network,
  security: ShieldCheck,
  management: Settings2,
  "data-ai": BrainCircuit,

  // Compute
  gce: Server,
  gke: Blocks,
  "cloud-run": Container,
  "cloud-functions": Zap,
  "app-engine": Rocket,

  // Storage & Databases
  "cloud-sql": Database,
  spanner: Globe,
  bigtable: Table2,
  bigquery: BarChart3,
  firestore: Layers,
  "cloud-storage": Archive,
  memorystore: Zap,

  // Networking
  vpc: Network,
  "cloud-lb": Waypoints,
  "cloud-cdn": Globe,
  "cloud-dns": Router,
  "cloud-interconnect": Cable,
  "cloud-nat": Router,

  // Security
  iam: KeyRound,
  "vpc-sc": ShieldHalf,
  "cloud-kms": Lock,
  "secret-manager": KeySquare,
  "cloud-armor": Shield,
  "cloud-iap": Fingerprint,

  // Management & Ops
  "cloud-monitoring": Activity,
  "cloud-logging": ScrollText,
  "cloud-build": Wrench,
  "cloud-deploy": Ship,
  iac: FileCode2,
  dms: DatabaseZap,

  // Data & AI
  pubsub: Radio,
  dataflow: Workflow,
  dataproc: Blocks,
  looker: LineChart,
  "vertex-ai": Sparkles,
  composer: Wind,
  datafusion: Combine,

  // Decision guides
  "decision-guides": Route,
  "hybrid-connectivity": Cable,
  "vpc-connectivity": Waypoints,
  "migration-path": ArrowRightLeft,

  // Generic
  cloud: Cloud,
  app: AppWindow,
};

export function iconFor(key: string): LucideIcon {
  return ICONS[key] ?? CircleDot;
}
