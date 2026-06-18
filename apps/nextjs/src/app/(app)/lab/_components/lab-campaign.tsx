"use client";

import type { ModelId } from "@mono/ai";
import type { Message } from "@mono/conversation";
import { SidebarTrigger } from "@mono/ui";

import { ModelSelector } from "~/app/(app)/_components/model-selector";
import { LabChat } from "./lab-chat";
import { TrajectoryChart } from "./trajectory-chart";

interface LabCampaignProps {
  campaignId: string;
  conversationId: string;
  title: string;
  supervised: boolean;
  hideNames: boolean;
  scrambled: boolean;
  maxIterations: number;
  objectiveLabel: string;
  objectiveMax: number;
  initialMessages: Message[];
  activeStreamId?: string | null;
  selectedModelId: ModelId;
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
      {children}
    </span>
  );
}

export function LabCampaign({
  campaignId,
  conversationId,
  title,
  supervised,
  hideNames,
  scrambled,
  maxIterations,
  objectiveLabel,
  objectiveMax,
  initialMessages,
  activeStreamId,
  selectedModelId,
}: LabCampaignProps) {
  return (
    <div className="bg-background flex h-full min-w-0 flex-col">
      <header className="flex flex-wrap items-center gap-2 px-2 py-1.5">
        <SidebarTrigger className="cursor-pointer" />
        <span className="truncate font-semibold">{title}</span>
        <Badge>{supervised ? "supervised" : "autonomous"}</Badge>
        {scrambled && <Badge>scrambled feedback</Badge>}
        {hideNames && <Badge>hidden names</Badge>}
        <div className="ml-auto">
          <ModelSelector selectedModelId={selectedModelId} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="min-h-0 min-w-0 flex-1">
          <LabChat
            conversationId={conversationId}
            campaignId={campaignId}
            scrambled={scrambled}
            initialMessages={initialMessages}
            activeStreamId={activeStreamId}
          />
        </div>
        <div className="h-72 shrink-0 border-t md:h-auto md:w-[380px] md:border-t-0 md:border-l">
          <TrajectoryChart
            campaignId={campaignId}
            conversationId={conversationId}
            maxIterations={maxIterations}
            objectiveLabel={objectiveLabel}
            objectiveMax={objectiveMax}
          />
        </div>
      </div>
    </div>
  );
}
