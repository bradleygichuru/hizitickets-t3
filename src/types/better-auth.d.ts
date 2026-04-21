import { type DefaultSession } from "better-auth/react";

declare module "better-auth/react" {
  interface Session {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }
}