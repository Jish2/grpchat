import * as readline from "node:readline";
import * as grpc from "@grpc/grpc-js";
import { chat, type ChatMessage } from "./proto";

const username = process.argv[2];
if (!username) {
  console.error("Usage: bun run client <username>");
  process.exit(1);
}

const address = process.env.GRPC_ADDR ?? "localhost:50051";
const client = new chat.ChatRoom(address, grpc.credentials.createInsecure());

// Duplex stream: read and write independently on the same RPC.
const stream = client.Join() as grpc.ClientDuplexStream<ChatMessage, ChatMessage>;

stream.on("data", (message: ChatMessage) => {
  const time = new Date(Number(message.timestamp)).toLocaleTimeString();
  console.log(`[${time}] ${message.username}: ${message.text}`);
});

stream.on("error", (err) => {
  console.error("stream error:", err.message);
  process.exit(1);
});

stream.on("end", () => {
  console.log("server closed the stream");
  process.exit(0);
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log(`Connected to ${address} as ${username}. Type a message and press Enter.`);

rl.on("line", (line) => {
  const text = line.trim();
  if (!text) return;
  stream.write({ username, text, timestamp: "0" });
});

rl.on("close", () => {
  stream.end();
});

process.on("SIGINT", () => {
  stream.end();
  rl.close();
});
