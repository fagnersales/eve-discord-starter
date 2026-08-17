import { httpBasic, localDev, vercelOidc, type AuthFn } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

const gatewayPassword = process.env.EVE_GATEWAY_PASSWORD;
const gatewayAuth: AuthFn<Request>[] = gatewayPassword
  ? [httpBasic({ username: "gateway", password: gatewayPassword })]
  : [];

export default eveChannel({
  auth: [vercelOidc(), localDev(), ...gatewayAuth],
});
