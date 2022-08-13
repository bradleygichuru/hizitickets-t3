// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { eventRouter } from "./event";
import { protectedExampleRouter } from "./protected-example-router";
import { ticketRouter } from "./ticket";
import { transactionRouter } from "./transaction";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("event.", eventRouter)
  .merge("ticket.",ticketRouter)
  .merge("transactions.",transactionRouter)
  .merge("question.", protectedExampleRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
