// Maximum number of agent steps (one AI-SDK model generation plus any tool
// executions in it) before the tool loop is force-stopped. Shared across all
// agents. The scientist agent (@mono/experiment) relies on this: each
// experiment is one step, so maxIterations must stay strictly below this to
// leave a step for the closing summary.
export const MAX_AGENT_STEPS = 100;
