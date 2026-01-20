import DodoPayments from "dodopayments";
import { env } from "../env";

const client = new DodoPayments({
  bearerToken: env.DODO_API_KEY,
  environment: env.DODO_ENVIRONMENT, // 'test_mode' | 'live_mode'
  webhookKey: env.DODO_WEBHOOK_SECRET,
  // logLevel: 'debug',
});

export default client;
