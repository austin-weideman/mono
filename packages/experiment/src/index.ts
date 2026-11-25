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
  scientistTurnAgent,
  type CreateScientistAgentOptions,
  type PresentedEnvironment,
} from "./agent";

// Application layer.
export {
  createCampaign,
  getCampaign,
  listCampaigns,
  listExperimentRuns,
} from "./application";

// Persistence helper used by the chat route to pick the agent for a conversation.
export { getCampaignByConversationId } from "./persistence";
