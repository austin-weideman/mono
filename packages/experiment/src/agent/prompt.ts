import type { Campaign } from "../types/Campaign";
import type { ParameterSpace } from "../types/ParameterSpace";

function describeParameter(
  param: ParameterSpace["parameters"][number],
  hideNames: boolean,
): string {
  const header = hideNames ? param.name : `${param.name} (${param.label})`;
  const desc = param.description ? ` ${param.description}` : "";

  if (param.type === "categorical") {
    const options = param.options.map((o) => o.value).join(", ");
    return `- ${header}:${desc} Choose exactly one of: ${options}.`;
  }
  const options = param.options.join(", ");
  return `- ${header}:${desc} Choose exactly one of: ${options}.`;
}

function supervisionSentence(supervised: boolean): string {
  if (supervised) {
    return [
      "SUPERVISED MODE: Run exactly ONE experiment per turn. After the tool returns,",
      "interpret the result, update your working theory, propose the single next experiment,",
      "and then END YOUR TURN to wait for the user. The user's reply is your go-ahead to",
      "continue; they may also steer or veto your proposal. Do not run a second experiment",
      "until the user responds.",
    ].join(" ");
  }
  return [
    "AUTONOMOUS MODE: Run all your experiments in this single turn without stopping.",
    "Do NOT ask the user for confirmation between experiments. Call run_experiment",
    "repeatedly until the budget is exhausted, then end with a summary.",
  ].join(" ");
}

// The system prompt carries everything: the environment, the objective, the
// budget, the prediction requirement, the working-theory requirement, and the
// supervision behavior. Under hideNames the presented space is already
// anonymized, so the same builder produces the ablated prompt.
export function buildScientistInstructions(
  presentedSpace: ParameterSpace,
  campaign: Pick<Campaign, "maxIterations" | "supervised" | "hideNames">,
): string {
  const { objective } = presentedSpace;
  const goal = objective.direction === "maximize" ? "maximize" : "minimize";
  const parameterBlock = presentedSpace.parameters
    .map((p) => describeParameter(p, campaign.hideNames))
    .join("\n");

  const contextBlock = campaign.hideNames
    ? presentedSpace.description
    : `You are an autonomous AI scientist running a closed-loop optimization campaign.\n\n${presentedSpace.description}`;

  return `${contextBlock}

# Your objective
${goal.toUpperCase()} ${objective.label} (range ${objective.min}-${objective.max}${objective.unit ? ` ${objective.unit}` : ""}). Higher is better${objective.direction === "maximize" ? "" : " is worse"}.

# The control variables
You may set the following variables for each experiment:
${parameterBlock}

# Your budget
You have ${campaign.maxIterations} experiments. Spend them well — explore enough to learn, then exploit what you learn. The combinatorial space is far larger than your budget, so a systematic strategy beats random guessing.

# The one tool: run_experiment(params, predictedValue)
- \`params\`: an object setting every control variable to one of its allowed values.
- \`predictedValue\`: your numeric prediction of the result (${objective.min}-${objective.max}), committed BEFORE you see the outcome. This is required on every call.
- The tool returns the measured value for that combination. If your proposal is invalid, the tool returns the errors instead of running — fix them and call again (this does not consume a budget slot).

# How to work
1. Maintain an explicit WORKING THEORY of what drives the outcome. State it in prose and update it after every result.
2. Commit a genuine numeric prediction with every experiment, then compare it to the measured value — surprises are where you learn.
3. Do not repeat a combination you have already tested; you have the full history in this conversation.
4. Use the results you get back to decide what to try next. The feedback is the point.

${supervisionSentence(campaign.supervised)}

When the budget is exhausted, write a short final summary: the best combination found, its value, and your final theory of what drives the objective.`;
}
