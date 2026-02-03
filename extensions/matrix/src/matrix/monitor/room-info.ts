import type { MatrixClient } from "@vector-im/matrix-bot-sdk";
import { MongoClient } from "mongodb";

export type MatrixRoomInfo = {
  name?: string;
  canonicalAlias?: string;
  altAliases: string[];
};

type RoomInfoCacheDoc = {
  room_id: string;
  name?: string;
  canonical_alias?: string;
  topic?: string;
  last_event_ts?: number;
};

function resolveRoomInfoMongoConfig(): { uri: string; db: string; collection: string } | null {
  const uri = process.env.MATRIX_ROOMINFO_MONGODB_URI ?? process.env.MONGODB_URI;
  const db = process.env.MATRIX_ROOMINFO_MONGODB_DB ?? process.env.MONGODB_DB ?? "matrix_index";
  const collection = process.env.MATRIX_ROOMINFO_MONGODB_COLLECTION ?? "room_info";

  if (!uri) {
    return null;
  }

  return { uri, db, collection };
}

let sharedMongo: MongoClient | null = null;
let sharedMongoPromise: Promise<MongoClient> | null = null;

async function getSharedMongoClient(uri: string): Promise<MongoClient> {
  if (sharedMongo) {
    return sharedMongo;
  }
  if (!sharedMongoPromise) {
    const client = new MongoClient(uri, {
      // Keep connection overhead low; this is just for light lookups.
      maxPoolSize: 3,
      serverSelectionTimeoutMS: 2000,
    });
    sharedMongoPromise = client.connect().then((c) => {
      sharedMongo = c;
      return c;
    });
  }
  return sharedMongoPromise;
}

export function createMatrixRoomInfoResolver(client: MatrixClient) {
  const roomInfoCache = new Map<string, MatrixRoomInfo>();

  const getRoomInfo = async (roomId: string): Promise<MatrixRoomInfo> => {
    const cached = roomInfoCache.get(roomId);
    if (cached) {
      return cached;
    }

    // 1) Try Mongo room-info cache (if configured)
    const mongoCfg = resolveRoomInfoMongoConfig();
    if (mongoCfg) {
      try {
        const mongo = await getSharedMongoClient(mongoCfg.uri);
        const doc = (await mongo
          .db(mongoCfg.db)
          .collection<RoomInfoCacheDoc>(mongoCfg.collection)
          .findOne({ room_id: roomId }, { projection: { _id: 0, room_id: 1, name: 1, canonical_alias: 1 } })) as
          | RoomInfoCacheDoc
          | null;

        if (doc && (doc.name || doc.canonical_alias)) {
          const info: MatrixRoomInfo = {
            name: doc.name,
            canonicalAlias: doc.canonical_alias,
            altAliases: [],
          };
          roomInfoCache.set(roomId, info);
          return info;
        }
      } catch {
        // ignore mongo failures; fallback to live Matrix lookups below
      }
    }

    // 2) Fallback: fetch state from Matrix
    let name: string | undefined;
    let canonicalAlias: string | undefined;
    let altAliases: string[] = [];

    try {
      const nameState = await client.getRoomStateEvent(roomId, "m.room.name", "").catch(() => null);
      name = nameState?.name;
    } catch {
      // ignore
    }

    try {
      const aliasState = await client.getRoomStateEvent(roomId, "m.room.canonical_alias", "").catch(() => null);
      canonicalAlias = aliasState?.alias;
      altAliases = aliasState?.alt_aliases ?? [];
    } catch {
      // ignore
    }

    const info = { name, canonicalAlias, altAliases };
    roomInfoCache.set(roomId, info);
    return info;
  };

  const getMemberDisplayName = async (roomId: string, userId: string): Promise<string> => {
    try {
      const memberState = await client.getRoomStateEvent(roomId, "m.room.member", userId).catch(() => null);
      return memberState?.displayname ?? userId;
    } catch {
      return userId;
    }
  };

  return {
    getRoomInfo,
    getMemberDisplayName,
  };
}
