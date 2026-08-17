import { Client } from "eve/client";

const password = process.env.EVE_GATEWAY_PASSWORD;
if (!password) throw new Error("EVE_GATEWAY_PASSWORD is required");

export const eve = new Client({
  host: process.env.EVE_HOST ?? "http://127.0.0.1:3000",
  auth: { basic: { username: "gateway", password } },
});
