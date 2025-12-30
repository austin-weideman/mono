"use client";

import { startTransition, useOptimistic, useState } from "react";

import type { ModelId } from "@microlearn/ai";
import { getAllModelIds, getModelConfig } from "@microlearn/ai";
import {
  Button,
  CheckIcon,
  ChevronDownIcon,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@microlearn/ui";

import { saveModelPreference } from "../_actions/model";

interface ModelSelectorProps {
  selectedModelId: ModelId;
  className?: string;
}

export function ModelSelector({
  selectedModelId,
  className,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  const models = getAllModelIds();
  const selectedModel = getModelConfig(optimisticModelId);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "cursor-pointer data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
            className,
          )}
        >
          {selectedModel.displayName}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px]">
        {models.map((modelId) => {
          const model = getModelConfig(modelId);
          const isSelected = modelId === optimisticModelId;

          return (
            <DropdownMenuItem
              key={modelId}
              className="cursor-pointer justify-between"
              onSelect={() => {
                setOpen(false);
                startTransition(() => {
                  setOptimisticModelId(modelId);
                  void saveModelPreference(modelId);
                });
              }}
            >
              {model.displayName}
              {isSelected && <CheckIcon className="size-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

