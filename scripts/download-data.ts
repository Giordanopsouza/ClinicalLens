import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const REPO_ID = "bavehackathon/2026-healthcare-ai";
const BASE_URL = `https://huggingface.co/datasets/${REPO_ID}/resolve/main`;
const DATA_DIR = path.join(process.cwd(), "data");

const FILES = [
  "clinical_cases.csv.gz",
  "labs_subset.csv.gz",
  "lab_dictionary.csv.gz",
  "prescriptions_subset.csv.gz",
  "diagnoses_subset.csv.gz",
  "diagnosis_dictionary.csv.gz",
];

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

for (const file of FILES) {
  const url = `${BASE_URL}/${file}`;
  const destination = path.join(DATA_DIR, file);

  if (fs.existsSync(destination)) {
    console.log(`Skipping ${file} (already exists)`);
    continue;
  }

  console.log(`Downloading ${file}...`);
  execSync(`curl -L -o "${destination}" "${url}"`, { stdio: "inherit" });
}

console.log("Finished downloading Phase 1 datasets.");
