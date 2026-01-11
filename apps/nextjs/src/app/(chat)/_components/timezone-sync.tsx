"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

export function TimezoneSync() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const hasSynced = useRef(false);

  const { data: userInfo } = useQuery(trpc.user.getMyInfo.queryOptions());

  const updateTimezone = useMutation(
    trpc.user.updateTimezone.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.user.pathKey() });
      },
    }),
  );

  useEffect(() => {
    if (hasSynced.current || userInfo === undefined) return;
    hasSynced.current = true;

    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (userInfo.timezone !== browserTimezone) {
      updateTimezone.mutate({ timezone: browserTimezone });
    }
  }, [userInfo, updateTimezone]);

  return null;
}
