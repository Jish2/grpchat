import path from "node:path";
import * as grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const PROTO_PATH = path.join(import.meta.dir, "../proto/chat.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const loaded = grpc.loadPackageDefinition(packageDefinition) as grpc.GrpcObject;

export const chat = loaded.chat as {
  ChatRoom: grpc.ServiceClientConstructor & {
    service: grpc.ServiceDefinition;
  };
};

export type ChatMessage = {
  username: string;
  text: string;
  timestamp: string;
};
