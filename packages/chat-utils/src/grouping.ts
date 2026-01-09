import { isToday, isYesterday, subMonths, subWeeks } from "date-fns";

import type { Conversation } from "@microlearn/conversation";

export interface GroupedConversations {
  today: Conversation[];
  yesterday: Conversation[];
  lastWeek: Conversation[];
  lastMonth: Conversation[];
  older: Conversation[];
}

export function groupConversationsByDate(
  conversations: Conversation[]
): GroupedConversations {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  return conversations.reduce(
    (groups, conversation) => {
      const date = new Date(conversation.updatedAt);

      if (isToday(date)) {
        groups.today.push(conversation);
      } else if (isYesterday(date)) {
        groups.yesterday.push(conversation);
      } else if (date > oneWeekAgo) {
        groups.lastWeek.push(conversation);
      } else if (date > oneMonthAgo) {
        groups.lastMonth.push(conversation);
      } else {
        groups.older.push(conversation);
      }

      return groups;
    },
    {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    } as GroupedConversations
  );
}
