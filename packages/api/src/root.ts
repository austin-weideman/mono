import { authRouter } from "./router/auth";
import { conversationRouter } from "./router/conversation";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  conversation: conversationRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
