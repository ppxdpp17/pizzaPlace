import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv"

dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN;
const ENDPOINT = process.env.MAILTRAP_ENDPOINT;

console.log("Mailtrap config:", { TOKEN, ENDPOINT });

const client = new MailtrapClient({
    endpoint: ENDPOINT,
    token: TOKEN,
});

const sender = {
  email: "hello@demomailtrap.co",
  name: "Big Boss'",
};
const recipients = [
  {
    email: "pedrosapageduarte@hotmail.com",
  }
];

client
  .send({
    from: sender,
    to: recipients,
    subject: "You are awesome!",
    text: "Congrats for sending test email with Mailtrap!",
    category: "Integration Test",
  })
  .then(console.log, console.error);