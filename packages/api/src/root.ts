import { attachmentRouter } from "./router/attachment";
import { authRouter } from "./router/auth";
import { billingRouter } from "./router/billing";
import { conversationRouter } from "./router/conversation";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  attachment: attachmentRouter,
  auth: authRouter,
  billing: billingRouter,
  conversation: conversationRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
