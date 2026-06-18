"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button, Input, Label, SidebarTrigger, Switch, toast } from "@mono/ui";

import { useTRPC } from "~/trpc/react";

const DEFAULT_MAX_ITERATIONS = 20;

export function LabHome() {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const campaignsQuery = useQuery(trpc.experiment.listCampaigns.queryOptions());

  const [title, setTitle] = useState("");
  const [supervised, setSupervised] = useState(false);
  const [maxIterations, setMaxIterations] = useState(DEFAULT_MAX_ITERATIONS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [scramble, setScramble] = useState(false);
  const [hideNames, setHideNames] = useState(false);

  const createMutation = useMutation(
    trpc.experiment.createCampaign.mutationOptions({
      onSuccess: (campaign) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.experiment.listCampaigns.pathKey(),
        });
        router.push(`/lab/${campaign.id}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title: title.trim() || undefined,
      supervised,
      hideNames,
      scramble,
      maxIterations,
    });
  };

  const campaigns = campaignsQuery.data ?? [];

  return (
    <div className="bg-background flex h-full flex-col overflow-y-auto">
      <header className="flex items-center gap-2 px-2 py-1.5">
        <SidebarTrigger className="cursor-pointer" />
        <span className="text-lg font-semibold">Lab</span>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6">
        {/* Create */}
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-4 rounded-xl border p-4"
        >
          <h2 className="font-semibold">New campaign</h2>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="campaign-title">Title</Label>
            <Input
              id="campaign-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Reductive amination campaign"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="supervised"
                checked={supervised}
                onCheckedChange={setSupervised}
              />
              <Label htmlFor="supervised">Supervised</Label>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="max-iterations">Experiments</Label>
              <Input
                id="max-iterations"
                type="number"
                min={1}
                max={99}
                value={maxIterations}
                onChange={(e) =>
                  setMaxIterations(
                    Number(e.target.value) || DEFAULT_MAX_ITERATIONS,
                  )
                }
                className="w-20"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-muted-foreground hover:text-foreground self-start text-xs"
          >
            {showAdvanced ? "Hide" : "Show"} study controls
          </button>

          {showAdvanced && (
            <div className="flex flex-col gap-3 rounded-lg border border-dashed p-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="scramble"
                  checked={scramble}
                  onCheckedChange={setScramble}
                />
                <Label htmlFor="scramble">
                  Scramble feedback
                  <span className="text-muted-foreground ml-1 text-xs font-normal">
                    (tests whether it uses results)
                  </span>
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="hide-names"
                  checked={hideNames}
                  onCheckedChange={setHideNames}
                />
                <Label htmlFor="hide-names">
                  Hide names
                  <span className="text-muted-foreground ml-1 text-xs font-normal">
                    (tests whether it uses prior knowledge)
                  </span>
                </Label>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="self-start"
          >
            {createMutation.isPending ? "Creating…" : "Create campaign"}
          </Button>
        </form>

        {/* List */}
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold">Your campaigns</h2>
          {campaignsQuery.isLoading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : campaigns.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No campaigns yet. Create one above.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {campaigns.map(({ campaign, bestValue, runCount }) => (
                <li key={campaign.id}>
                  <Link
                    href={`/lab/${campaign.id}`}
                    className="hover:bg-muted/50 flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {campaign.title ?? "Untitled campaign"}
                      </div>
                      <div className="text-muted-foreground flex flex-wrap gap-x-2 text-xs">
                        <span>{supervisedLabel(campaign.supervised)}</span>
                        {campaign.scrambleSeed != null && (
                          <span>· scrambled</span>
                        )}
                        {campaign.hideNames && <span>· hidden names</span>}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-semibold">
                        {bestValue != null ? bestValue.toFixed(1) : "—"}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {runCount} / {campaign.maxIterations}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function supervisedLabel(supervised: boolean): string {
  return supervised ? "supervised" : "autonomous";
}
