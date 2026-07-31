import { ConvexHttpClient } from "convex/browser";

export function getConvexClient(token?: string): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  const client = new ConvexHttpClient(url);
  if (token) {
    client.setAuth(token);
  }
  return client;
}
