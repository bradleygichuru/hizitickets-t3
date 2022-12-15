import { router } from "../trpc";
import { transactionRouter } from "./transaction";
import { eventsRouter } from "./event";
import { ticketRouter } from "./ticket";
export const appRouter = router({
  events: eventsRouter,
  ticket: ticketRouter,
  transaction: transactionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
