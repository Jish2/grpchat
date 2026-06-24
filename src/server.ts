import * as grpc from "@grpc/grpc-js";
import { chat, type ChatMessage } from "./proto";

const PORT = Number(process.env.PORT ?? 50051);
const HOST = process.env.HOST ?? "0.0.0.0";

// Every active Join stream — one per connected client.
const clients = new Set<grpc.ServerDuplexStream<ChatMessage, ChatMessage>>();

function broadcast(message: ChatMessage, except?: grpc.ServerDuplexStream<ChatMessage, ChatMessage>) {
  for (const client of clients) {
    if (client !== except) {
      client.write(message);
    }
  }
}

function join(call: grpc.ServerDuplexStream<ChatMessage, ChatMessage>) {
  clients.add(call);
  console.log(`+ ${call.getPeer()} joined (${clients.size} connected)`);

  call.on("data", (incoming: ChatMessage) => {
    const message: ChatMessage = {
      username: incoming.username,
      text: incoming.text,
      timestamp: String(Date.now()),
    };
    // Echo to sender and broadcast to everyone else.
    call.write(message);
    broadcast(message, call);
  });

  const leave = () => {
    clients.delete(call);
    console.log(`- ${call.getPeer()} left (${clients.size} connected)`);
  };

  call.on("end", leave);
  call.on("cancelled", leave);
  call.on("error", (err) => {
    console.error("stream error:", err.message);
    leave();
  });
}

const server = new grpc.Server();
server.addService(chat.ChatRoom.service, { Join: join });

server.bindAsync(
  `${HOST}:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (err) => {
    if (err) throw err;
    console.log(`gRPC chat server listening on ${HOST}:${PORT}`);
  },
);
