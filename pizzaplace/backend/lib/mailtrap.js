import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv"

dotenv.config();

export const mailTrapClient = new MailtrapClient({
  endpoint: process.env.MAILTRAP_ENDPOINT,
  token: process.env.MAILTRAP_TOKEN,
});

export const sender = {
  email: "hello@demomailtrap.co",
  name: "Big Boss",
};