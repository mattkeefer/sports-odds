import "dotenv/config";
import express from "express";
import cors from "cors";
import { getEvents } from "./sportsGameOddsClient.js";
import { EventsQuery } from "./types.js";
import { initializeApp } from "firebase-admin/app";
import { Query, DocumentData } from "firebase-admin/firestore";
import admin from "firebase-admin";
import * as serviceAccount from "../../sports-odds-4fe36-firebase-adminsdk-fbsvc-aaeac952be.json" with { type: "json" };

const PORT = Number(process.env.PORT ?? 4000);
const CORS_OPTIONS = {
  origin: "http://localhost:5173",
  methods: "*",
  credentials: true,
};

const app = initializeApp({
  credential: admin.credential.cert({
    projectId: serviceAccount.default.project_id,
    privateKey: serviceAccount.default.private_key,
    clientEmail: serviceAccount.default.client_email,
  }),
});

function parseBoolean(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function parseNumber(value: string | null): number | undefined {
  if (value === null) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function toStoredDateString(
  value: string | undefined,
  endOfDay = false,
): string | undefined {
  if (!value) return undefined;

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (endOfDay) {
      date.setHours(23, 59, 59, 999);
    }
    return date.toISOString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function toEventsQuery(searchParams: any): EventsQuery {
  return {
    oddsAvailable: parseBoolean(searchParams["oddsAvailable"]) ?? true,
    finalized: parseBoolean(searchParams["finalized"]) ?? false,
    live: parseBoolean(searchParams["live"]) ?? false,
    leagueID: searchParams["leagueID"] ?? undefined,
    oddID: searchParams["oddID"] ?? undefined,
    bookmakerID: searchParams["bookmakerID"] ?? undefined,
    startsAfter: searchParams["startsAfter"] ?? undefined,
    includeAltLines: parseBoolean(searchParams["includeAltLines"]),
    cursor: searchParams["cursor"],
    limit: parseNumber(searchParams["limit"]) ?? 1,
  };
}

const server = express();
server.use(express.json());
server.use(cors(CORS_OPTIONS));

server.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

server.get("/api/events", async (req, res) => {
  try {
    const query = toEventsQuery(req.query);
    const result = await getEvents(query);
    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown backend error";
    res.status(502).json({ error: message });
    console.error("Error handling /api/events request:", error);
  }
});

server.get("/api/bets", async (req, res) => {
  try {
    const { startsAfter, startsBefore } = req.query;
    let query: Query<DocumentData> = admin.firestore().collection("bets");

    const startsAfterIso = toStoredDateString(startsAfter as string | undefined);
    const startsBeforeIso = toStoredDateString(
      startsBefore as string | undefined,
      true,
    );

    if (startsAfterIso) {
      query = query.where("eventDate", ">=", startsAfterIso);
    }

    if (startsBeforeIso) {
      query = query.where("eventDate", "<=", startsBeforeIso);
    }

    const betsSnapshot = await query.get();
    const bets = betsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json({ success: true, data: bets });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown backend error";
    res.status(502).json({ error: message });
    console.error("Error handling /api/bets request:", error);
  }
});

server.post("/api/bets", async (req, res) => {
  try {
    const betData = req.body;
    const result = await admin
      .firestore()
      .collection("bets")
      .doc(betData.id)
      .set(betData);
    res.status(201).json({ id: betData.id, success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown backend error";
    res.status(502).json({ error: message });
    console.error("Error handling /api/bets request:", error);
  }
});

server.put("/api/bets/:id", async (req, res) => {
  try {
    const betId = req.params.id;
    const betData = req.body;
    await admin.firestore().collection("bets").doc(betId).update(betData);
    res.status(200).json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown backend error";
    res.status(502).json({ error: message });
    console.error("Error handling /api/bets/:id request:", error);
  }
});

server.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
