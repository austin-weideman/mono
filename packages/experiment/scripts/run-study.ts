// The mini-study: learning or remembering?
//
// Runs three agent cells (normal / scrambled feedback / hidden names), REPEATS
// times each, all autonomous, against the same database via the same
// application functions the app uses. No dev server, no serverless 300s limit
// (this is a local Node process). Usage recording rides along.
//
//   doppler run -- pnpm -F @mono/experiment study
//
// Env:
//   STUDY_USER_ID  (required) — owner for the created campaigns; must be a real user id.
//   STUDY_MODEL    (optional) — a ModelId (default claude-sonnet-4.6).
//   STUDY_REPEATS  (optional) — repeats per cell (default 3).
//
// This calls the agent and therefore costs money. Run the random floor first
// with `pnpm -F @mono/experiment study:baseline` (free).
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getGatewayId, isValidModelId, ModelId } from "@mono/ai";
import { sendMessage } from "@mono/conversation";
import { userActor } from "@mono/core-types";
import { db } from "@mono/db/client";

import {
  bestSoFarCurve,
  createCampaign,
  listExperimentRuns,
  meanCurve,
  runScientistTurn,
} from "../src/index";

const MAX_ITERATIONS = 20;
const KICKOFF =
  "Begin the campaign now. Run the entire budget of experiments autonomously, committing a numeric prediction with each one, and finish with a summary of the best settings you found.";

interface Cell {
  key: string;
  scramble: boolean;
  hideNames: boolean;
}

const CELLS: Cell[] = [
  { key: "normal", scramble: false, hideNames: false },
  { key: "scrambled", scramble: true, hideNames: false },
  { key: "hidden_names", scramble: false, hideNames: true },
];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required env var ${name}`);
    process.exit(1);
  }
  return value;
}

// Best-so-far is monotonic, so pad short curves with their last value to align
// lengths before averaging.
function normalizeCurve(curve: number[], length: number): number[] {
  if (curve.length === 0) return new Array<number>(length).fill(0);
  const out = curve.slice(0, length);
  while (out.length < length) out.push(out[out.length - 1]!);
  return out;
}

async function runOneCampaign(
  userId: string,
  gatewayModelId: string,
  cell: Cell,
  repeat: number,
): Promise<number[]> {
  const actor = userActor(userId);
  const scrambleSeed = cell.scramble ? 1000 + repeat : undefined;

  const campaign = await createCampaign(db, actor, {
    userId,
    title: `Study: ${cell.key} #${repeat + 1}`,
    environmentKey: "reductive_amination",
    supervised: false,
    hideNames: cell.hideNames,
    scramble: cell.scramble,
    scrambleSeed,
    maxIterations: MAX_ITERATIONS,
  });

  await sendMessage(db, actor, {
    conversationId: campaign.conversationId,
    role: "user",
    parts: [{ type: "text", text: KICKOFF }],
  });

  await runScientistTurn(db, {
    campaignId: campaign.id,
    userId,
    gatewayModelId,
  });

  const runs = await listExperimentRuns(db, actor, { campaignId: campaign.id });
  // Score on the TRUE measured value, never the (possibly scrambled) shown one.
  const curve = bestSoFarCurve(runs.map((r) => Number(r.measuredValue)));
  console.log(
    `  ${cell.key} #${repeat + 1}: ${runs.length} experiments, best ${
      curve[curve.length - 1]?.toFixed(1) ?? "—"
    }`,
  );
  return normalizeCurve(curve, MAX_ITERATIONS);
}

async function main(): Promise<void> {
  const userId = requireEnv("STUDY_USER_ID");
  const repeats = Number(process.env.STUDY_REPEATS ?? "3");
  const modelId = process.env.STUDY_MODEL ?? ModelId.CLAUDE_SONNET_4_6;
  if (!isValidModelId(modelId)) {
    console.error(`Invalid STUDY_MODEL: ${modelId}`);
    process.exit(1);
  }
  const gatewayModelId = getGatewayId(modelId);

  console.log(
    `Study: model=${modelId}, repeats=${repeats}, ${CELLS.length} cells → ${
      CELLS.length * repeats
    } campaigns`,
  );

  const here = dirname(fileURLToPath(import.meta.url));
  const outPath = join(here, "..", "study", "results", "study-results.json");
  mkdirSync(dirname(outPath), { recursive: true });

  const cells: Record<string, { curves: number[][]; mean: number[] }> = {};
  const failures: string[] = [];

  const writeResults = (): void => {
    writeFileSync(
      outPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          model: modelId,
          repeats,
          maxIterations: MAX_ITERATIONS,
          failures,
          cells,
        },
        null,
        2,
      ) + "\n",
    );
  };

  for (const cell of CELLS) {
    console.log(`Cell: ${cell.key}`);
    const curves: number[][] = [];
    for (let repeat = 0; repeat < repeats; repeat++) {
      try {
        curves.push(await runOneCampaign(userId, gatewayModelId, cell, repeat));
      } catch (err) {
        failures.push(`${cell.key} #${repeat + 1}`);
        console.error(`  ${cell.key} #${repeat + 1} FAILED:`, err);
      }
      cells[cell.key] = { curves, mean: meanCurve(curves) };
      writeResults();
    }
  }

  console.log(
    failures.length === 0
      ? `Wrote ${outPath}`
      : `Wrote ${outPath} — ${failures.length} campaign(s) failed: ${failures.join(", ")}`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
