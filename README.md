# grpchat

A minimal group chat built with **gRPC bidirectional streaming** and [Bun](https://bun.sh). The goal is to learn how bidi streams work — not to be production-ready.

## Concepts

| Piece | Role |
|-------|------|
| `proto/chat.proto` | Service contract: one RPC, `Join`, with **stream** on both request and response |
| `src/server.ts` | Holds open streams in a `Set` and broadcasts each incoming message |
| `src/client.ts` | Opens one duplex stream, writes stdin lines, prints incoming messages |

In a bidi RPC, client and server each get a **duplex stream**: they can read and write in any order. Message order is preserved per direction.

```
Client                         Server
  |------ Join() stream ------->|
  |<----- ChatMessage ----------|  (broadcast)
  |------ ChatMessage --------->|
  |<----- ChatMessage ----------|
```

## Quick start

```bash
bun install

# terminal 1
bun run server

# terminal 2
bun run client alice

# terminal 3
bun run client bob
```

Type in either client terminal; both see every message.

### Options

| Env var | Default | Used by |
|---------|---------|---------|
| `PORT` | `50051` | server |
| `HOST` | `0.0.0.0` | server |
| `GRPC_ADDR` | `localhost:50051` | client |

## Project layout

```
proto/chat.proto   # ChatRoom.Join(stream ChatMessage) returns (stream ChatMessage)
src/proto.ts       # loads .proto into a gRPC service definition
src/server.ts      # gRPC server
src/client.ts      # CLI client
```

## License

TBD
