import { ConvexHttpClient } from "convex/browser";

import { api } from "../convex/_generated/api";
import { loadEnvLocal } from "./load-env";

loadEnvLocal();

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is required in .env.local");
}

const client = new ConvexHttpClient(convexUrl);

async function verifySeed(): Promise<void> {
  const patients = await client.query(api.queries.getPatientList, { limit: 5 });

  console.log(
    "Patients (first page):",
    patients.map((patient) => `${patient.hadm_id} - ${patient.admission_diagnosis}`),
  );

  if (patients.length === 0) {
    throw new Error("No patients found. Seed may have failed.");
  }

  const testHadmId = patients[0].hadm_id;
  const patient = await client.query(api.queries.getPatientById, {
    hadm_id: testHadmId,
  });

  console.log("Patient:", {
    hadm_id: patient?.hadm_id,
    age: patient?.age,
    gender: patient?.gender,
    diagnosis: patient?.admission_diagnosis,
    has_embedding: Boolean(patient?.embedding),
  });

  const labs = await client.query(api.queries.getLabsByAdmission, {
    hadm_id: testHadmId,
  });
  console.log("Lab rows:", labs.length);

  const prescriptions = await client.query(api.queries.getPrescriptionsByAdmission, {
    hadm_id: testHadmId,
  });
  console.log("Prescription rows:", prescriptions.length);

  const diagnoses = await client.query(api.queries.getDiagnosesByAdmission, {
    hadm_id: testHadmId,
  });
  console.log("Diagnosis rows:", diagnoses.length);

  if (patient?.embedding && patient.embedding.length > 0) {
    const similarCases = await client.action(api.actions.searchDischargeSummaries, {
      embedding: patient.embedding,
      limit: 3,
    });
    console.log(
      "Vector search sample:",
      similarCases.map((item) => ({
        hadm_id: item.hadm_id,
        score: item.score,
      })),
    );
  } else {
    console.log("Skipping vector search test because embedding is missing.");
  }

  console.log("Verification complete.");
}

verifySeed().catch((error) => {
  console.error("Verification failed:", error);
  process.exitCode = 1;
});
