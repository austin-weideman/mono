// Types
export * from "./types";

// Environment — the future swap seam (space, runExperiment) plus dataset access.
export {
  REDUCTIVE_AMINATION,
  canonicalKey,
  datasetValues,
  getDataset,
  getParamOrder,
  isKnownEnvironment,
  lookupValue,
  reductiveAminationSpace,
  runExperiment,
  space,
  validateParams,
  type Dataset,
  type ValidationResult,
} from "./environment";

// Pure utils (used by the headless study and figures).
export {
  bestSoFarCurve,
  buildNameAblation,
  mean,
  meanCurve,
  mulberry32,
  randomBaselineCurve,
  seededPermutation,
  type NameAblation,
} from "./utils";

// Agent.
export {
  RUN_EXPERIMENT_TOOL_NAME,
  buildScientistInstructions,
  createScientistAgent,
  presentEnvironment,
  type CreateScientistAgentOptions,
  type PresentedEnvironment,
  type ScientistAgentResult,
  type ScientistMessage,
} from "./agent";

// Application layer.
export {
  createCampaign,
  getCampaign,
  listCampaigns,
  listExperimentRuns,
  runScientistTurn,
  type RunScientistTurnInput,
} from "./application";

// Persistence helper used by the chat route to detect campaign conversations.
export { getCampaignByConversationId } from "./persistence";
