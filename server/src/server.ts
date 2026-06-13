import "dotenv/config";
import express from "express";
import cors from "cors";
import { getEvents } from "./sportsGameOddsClient.js";
import { EventsQuery } from "./types.js";
import { initializeApp } from "firebase-admin/app";
import {
  Query,
  DocumentData,
  FieldPath,
  FieldValue,
} from "firebase-admin/firestore";
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

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

function createDefaultUserFilters() {
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return {
    selectedSportsbooks: ["FanDuel", "BetMGM"],
    selectedLeagues: ["NBA", "MLB", "NHL"],
    oddsRange: [-200, 200],
    minEV: 2,
    dateRange: [today, nextWeek],
    bankroll: 1000,
    pinnyMode: false,
    darkMode: false,
  };
}

function createDefaultSubscription() {
  return {
    tier: "free",
    status: "inactive",
    updatedAt: new Date().toISOString(),
  };
}

function toPublicUser(doc: admin.firestore.DocumentSnapshot) {
  const data = doc.data();
  if (!data) return null;

  return {
    id: doc.id,
    phoneNumber: data.phoneNumber ?? "",
    username: data.username ?? "",
    firstName: data.firstName ?? "",
    lastName: data.lastName ?? "",
    state: data.state ?? "",
    savedFilters: data.savedFilters ?? createDefaultUserFilters(),
    subscription: data.subscription ?? createDefaultSubscription(),
    placedBets: Array.isArray(data.placedBets) ? data.placedBets : [],
  };
}

async function findUserByIdentifier(identifier: string) {
  const usersRef = admin.firestore().collection("users");
  const normalizedUsername = normalizeUsername(identifier);
  const normalizedPhone = normalizePhone(identifier);

  const usernameSnapshot = await usersRef
    .where("username", "==", normalizedUsername)
    .limit(1)
    .get();
  if (!usernameSnapshot.empty) {
    return usernameSnapshot.docs[0];
  }

  if (!normalizedPhone) {
    return null;
  }

  const phoneSnapshot = await usersRef
    .where("phoneNumber", "==", normalizedPhone)
    .limit(1)
    .get();
  return phoneSnapshot.empty ? null : phoneSnapshot.docs[0];
}

function filterBetByDate(
  bet: FirebaseFirestore.DocumentData,
  startsAfterIso?: string,
  startsBeforeIso?: string,
): boolean {
  const eventDateValue = bet.eventDate;
  if (!eventDateValue) return true;

  const eventDate =
    typeof eventDateValue === "string"
      ? new Date(eventDateValue)
      : eventDateValue.toDate?.();
  if (!eventDate || Number.isNaN(eventDate.getTime())) return true;

  if (startsAfterIso && eventDate < new Date(startsAfterIso)) return false;
  if (startsBeforeIso && eventDate > new Date(startsBeforeIso)) return false;
  return true;
}

async function getBetsByIds(betIds: string[]): Promise<DocumentData[]> {
  const firestore = admin.firestore();
  const uniqueBetIds = [...new Set(betIds)];
  const chunks: string[][] = [];

  for (let index = 0; index < uniqueBetIds.length; index += 10) {
    chunks.push(uniqueBetIds.slice(index, index + 10));
  }

  const snapshots = await Promise.all(
    chunks.map((chunk) =>
      firestore
        .collection("bets")
        .where(FieldPath.documentId(), "in", chunk)
        .get(),
    ),
  );

  return snapshots.flatMap((snapshot) =>
    snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
  );
}

const server = express();
server.use(express.json());
server.use(cors(CORS_OPTIONS));

server.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

server.post("/api/users/register", async (req, res) => {
  try {
    const { phoneNumber, firstName, lastName, username, state } = req.body;

    if (!phoneNumber || !firstName || !lastName || !username || !state) {
      res.status(400).json({ error: "Missing required user fields." });
      return;
    }

    const usernameLower = normalizeUsername(username);
    const phoneDigits = normalizePhone(phoneNumber);
    const usersRef = admin.firestore().collection("users");

    const [existingUsername, existingPhone] = await Promise.all([
      usersRef.where("usernameLower", "==", usernameLower).limit(1).get(),
      usersRef.where("phoneDigits", "==", phoneDigits).limit(1).get(),
    ]);

    if (!existingUsername.empty) {
      res.status(409).json({ error: "Username is already registered." });
      return;
    }

    if (!existingPhone.empty) {
      res.status(409).json({ error: "Phone number is already registered." });
      return;
    }

    const docRef = usersRef.doc();
    await docRef.set({
      phoneNumber,
      phoneDigits,
      firstName,
      lastName,
      username,
      usernameLower,
      state,
      savedFilters: createDefaultUserFilters(),
      subscription: createDefaultSubscription(),
      placedBets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const createdUser = await docRef.get();
    res.status(201).json({ success: true, user: toPublicUser(createdUser) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown backend error";
    res.status(502).json({ error: message });
    console.error("Error handling /api/users/register request:", error);
  }
});

server.post("/api/users/login", async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      res.status(400).json({ error: "Username or phone number is required." });
      return;
    }

    const userDoc = await findUserByIdentifier(identifier);
    if (!userDoc) {
      res.status(404).json({ error: "No account found for that login." });
      return;
    }

    res.status(200).json({ success: true, user: toPublicUser(userDoc) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown backend error";
    res.status(502).json({ error: message });
    console.error("Error handling /api/users/login request:", error);
  }
});

server.get("/api/users/:userId/bets", async (req, res) => {
  try {
    const { startsAfter, startsBefore } = req.query;
    const userSnapshot = await admin
      .firestore()
      .collection("users")
      .doc(req.params.userId)
      .get();
    const user = toPublicUser(userSnapshot);

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    if (user.placedBets.length === 0) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const startsAfterIso = toStoredDateString(
      startsAfter as string | undefined,
    );
    const startsBeforeIso = toStoredDateString(
      startsBefore as string | undefined,
      true,
    );
    const bets = (await getBetsByIds(user.placedBets))
      .filter((bet) => bet.user === user.id)
      .filter((bet) => filterBetByDate(bet, startsAfterIso, startsBeforeIso));

    res.status(200).json({ success: true, data: bets });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown backend error";
    res.status(502).json({ error: message });
    console.error("Error handling /api/users/:userId/bets request:", error);
  }
});

server.post("/api/users/:userId/bets", async (req, res) => {
  try {
    const betData = req.body;
    const userRef = admin
      .firestore()
      .collection("users")
      .doc(req.params.userId);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    if (!betData?.id) {
      res.status(400).json({ error: "Bet id is required." });
      return;
    }

    const betWithUser = {
      ...betData,
      user: req.params.userId,
    };

    await admin
      .firestore()
      .collection("bets")
      .doc(betWithUser.id)
      .set(betWithUser);

    await userRef.update({
      placedBets: FieldValue.arrayUnion(betWithUser.id),
      updatedAt: new Date().toISOString(),
    });

    const updatedUser = await userRef.get();
    res.status(201).json({
      id: betWithUser.id,
      success: true,
      user: toPublicUser(updatedUser),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown backend error";
    res.status(502).json({ error: message });
    console.error("Error handling /api/users/:userId/bets request:", error);
  }
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

    const startsAfterIso = toStoredDateString(
      startsAfter as string | undefined,
    );
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
