import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const IMPORT_DIR = path.join(process.cwd(), "data", "_convex_import");

function ensureImportDir(): void {
  fs.mkdirSync(IMPORT_DIR, { recursive: true });
}

async function writeJsonLines<T extends object>(filename: string, rows: T[]): Promise<string> {
  const filePath = path.join(IMPORT_DIR, filename);
  const writer = fs.createWriteStream(filePath, { encoding: "utf8" });
  await new Promise<void>((resolve, reject) => {
    writer.on("error", reject);
    writer.on("finish", resolve);
    for (const row of rows) {
      writer.write(`${JSON.stringify(row)}\n`);
    }
    writer.end();
  });
  return filePath;
}

function runConvexImport(table: string, filePath: string): void {
  const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";
  const args = [
    "convex",
    "import",
    "-y",
    "--replace",
    "--format",
    "jsonLines",
    "--table",
    table,
    filePath,
  ];
  const result = spawnSync(npxCmd, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`convex import failed for table "${table}"`);
  }
}

async function seedAlerts(): Promise<void> {
  ensureImportDir();
  console.log("Seeding alerts...\n");

  const now = Date.now();
  const alerts = [
    {
      hadm_id: 149568,
      severity: "critical",
      title: "Medication Interaction: Warfarin + Aspirin",
      description: "High risk of gastrointestinal hemorrhage. Patient has history of peptic ulcer disease noted in discharge summary.",
      status: "unresolved",
      timestamp: now - 1000 * 60 * 12, // 12 mins ago
      category: "Medication",
    },
    {
      hadm_id: 132331,
      severity: "warning",
      title: "Missing Diagnostic Context: Furosemide",
      description: "Prescription for IV Furosemide found but no corresponding diagnosis of Heart Failure or Edema in ICD-9 list.",
      status: "unresolved",
      timestamp: now - 1000 * 60 * 60 * 2, // 2 hours ago
      category: "Diagnosis",
    },
    {
      hadm_id: 193143,
      severity: "info",
      title: "Lab Result: Creatinine Up-trend",
      description: "Creatinine increased from 1.2 to 1.6 mg/dL over last 24 hours. Suggest checking BUN and electrolytes.",
      status: "unresolved",
      timestamp: now - 1000 * 60 * 60 * 4, // 4 hours ago
      category: "Lab",
    },
    {
      hadm_id: 199943,
      severity: "critical",
      title: "Hyperkalemia Alert",
      description: "Potassium level critical: 6.2 mEq/L. Recommend immediate EKG and medical management.",
      status: "unresolved",
      timestamp: now - 1000 * 60 * 30, // 30 mins ago
      category: "Lab",
    },
    {
      hadm_id: 181043,
      severity: "warning",
      title: "Duplicate Therapy: Lisinopril + Enalapril",
      description: "Patient prescribed two ACE inhibitors. Possible duplicate therapy.",
      status: "unresolved",
      timestamp: now - 1000 * 60 * 60 * 6, // 6 hours ago
      category: "Medication",
    },
    {
      hadm_id: 149568,
      severity: "info",
      title: "Vitals: Borderline Hypotension",
      description: "Systolic blood pressure trending down (95-100 mmHg). Monitor fluid status.",
      status: "resolved",
      timestamp: now - 1000 * 60 * 60 * 24, // 1 day ago
      category: "Vitals",
    }
  ];

  const alertsFile = await writeJsonLines("alerts.jsonl", alerts);
  runConvexImport("alerts", alertsFile);

  console.log("\nAlerts seed complete.");
}

seedAlerts().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
