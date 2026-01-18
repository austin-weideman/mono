"use client";

import { startTransition, useOptimistic, useState } from "react";
import Image from "next/image";

import type { ModelId, ModelProvider } from "@microlearn/ai";
import {
  getModelConfig,
  getModelsGroupedByProvider,
  PROVIDER_DISPLAY_NAMES,
} from "@microlearn/ai";
import {
  Button,
  CheckIcon,
  ChevronDownIcon,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@microlearn/ui";

import { saveModelPreference } from "../_actions/model";

const PROVIDER_ORDER: ModelProvider[] = [
  "anthropic",
  "openai",
  "google",
  "xai",
];

function ProviderLogo({ provider }: { provider: ModelProvider }) {
  return (
    <Image
      src={`https://models.dev/logos/${provider}.svg`}
      alt={`${provider} logo`}
      width={16}
      height={16}
      className="size-4 dark:invert"
      unoptimized
    />
  );
}

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

  const groupedModels = getModelsGroupedByProvider();
  const selectedModel = getModelConfig(optimisticModelId);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground cursor-pointer gap-2",
            className,
          )}
        >
          <ProviderLogo provider={selectedModel.provider} />
          {selectedModel.displayName}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[220px]">
        {PROVIDER_ORDER.map((provider) => {
          const models = groupedModels[provider];
          if (models.length === 0) return null;

          return (
            <DropdownMenuGroup key={provider}>
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                {PROVIDER_DISPLAY_NAMES[provider]}
              </DropdownMenuLabel>
              {models.map((modelId) => {
                const model = getModelConfig(modelId);
                const isSelected = modelId === optimisticModelId;

                return (
                  <DropdownMenuItem
                    key={modelId}
                    className="cursor-pointer gap-2.5"
                    onSelect={() => {
                      setOpen(false);
                      startTransition(() => {
                        setOptimisticModelId(modelId);
                        void saveModelPreference(modelId);
                      });
                    }}
                  >
                    <ProviderLogo provider={provider} />
                    <span className="flex-1">{model.displayName}</span>
                    {isSelected && <CheckIcon className="size-4" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
