"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useTRPC } from "~/trpc/react";

// Visible in both light and dark themes.
const COLOR_BEST = "#16a34a"; // green-600
const COLOR_MEASURED = "#2563eb"; // blue-600
const COLOR_PREDICTED = "#94a3b8"; // slate-400

interface TrajectoryChartProps {
  campaignId: string;
  conversationId: string;
  maxIterations: number;
  objectiveLabel: string;
  objectiveMax: number;
}

export function TrajectoryChart({
  campaignId,
  conversationId,
  maxIterations,
  objectiveLabel,
  objectiveMax,
}: TrajectoryChartProps) {
  const trpc = useTRPC();
  const runsQuery = useQuery(
    trpc.experiment.listExperimentRuns.queryOptions({ campaignId }),
  );
  // Campaign cost = spend on its backing conversation.
  const spendQuery = useQuery(
    trpc.billing.conversationSpend.queryOptions({ conversationId }),
  );

  const runs = useMemo(() => runsQuery.data ?? [], [runsQuery.data]);

  const data = useMemo(() => {
    const out: {
      iteration: number;
      measured: number;
      predicted: number;
      best: number;
    }[] = [];
    for (const run of runs) {
      const measured = Number(run.measuredValue);
      const prevBest = out.at(-1)?.best ?? -Infinity;
      out.push({
        iteration: run.iteration,
        measured,
        predicted: Number(run.predictedValue),
        best: Math.max(prevBest, measured),
      });
    }
    return out;
  }, [runs]);

  const bestSoFar = data.at(-1)?.best ?? null;
  const totalUsd = Number(spendQuery.data?.totalUsd ?? "0");

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold">Trajectory</h2>
          <p className="text-muted-foreground text-xs">
            {runs.length} / {maxIterations} experiments
            {bestSoFar != null && (
              <>
                {" · best "}
                <span className="text-foreground font-medium">
                  {bestSoFar.toFixed(1)}
                </span>
              </>
            )}
          </p>
        </div>
        {totalUsd > 0 && (
          <span className="text-muted-foreground text-xs">
            ${totalUsd.toFixed(2)}
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1">
        {data.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            No experiments yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 12, bottom: 8, left: -16 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="iteration"
                type="number"
                domain={[1, maxIterations]}
                allowDecimals={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                domain={[0, objectiveMax]}
                tick={{ fontSize: 11 }}
                width={40}
              />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                labelFormatter={(label) => `Experiment ${label}`}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="stepAfter"
                dataKey="best"
                name={`best ${objectiveLabel}`}
                stroke={COLOR_BEST}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="measured"
                name="measured"
                stroke={COLOR_MEASURED}
                strokeWidth={1.5}
                dot={{ r: 2 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                name="predicted"
                stroke={COLOR_PREDICTED}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={{ r: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
