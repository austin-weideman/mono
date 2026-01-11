import { useEffect, useRef } from "react";
import * as Localization from "expo-localization";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { trpc } from "~/utils/api";

export function TimezoneSync() {
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

    const deviceTimezone = Localization.getCalendars()[0]?.timeZone ?? "UTC";

    if (userInfo.timezone !== deviceTimezone) {
      updateTimezone.mutate({ timezone: deviceTimezone });
    }
  }, [userInfo, updateTimezone]);

  return null;
}
