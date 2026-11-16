// server/app.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";

// server/lib/auth.ts
import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
var COOKIE = "zenna_session";
var DEV_SECRET = "zenna-local-dev-only-not-for-production";
function sessionSecret() {
  const fromEnv = process.env.SESSION_SECRET?.trim();
  if (fromEnv && fromEnv.length >= 16) {
    return new TextEncoder().encode(fromEnv);
  }
  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    if (process.env.DATABASE_URL?.trim()) {
      return null;
    }
  }
  return new TextEncoder().encode(DEV_SECRET);
}
function authConfigured() {
  return sessionSecret() !== null;
}
async function hashPassword(password) {
  return hash(password, 10);
}
async function verifyPassword(password, passwordHash) {
  return compare(password, passwordHash);
}
async function createSessionToken(user) {
  const secret = sessionSecret();
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  return new SignJWT({
    email: user.email,
    displayName: user.displayName
  }).setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuedAt().setExpirationTime("30d").sign(secret);
}
async function readSession(c) {
  const secret = sessionSecret();
  if (!secret) return null;
  const token = getCookie(c, COOKIE);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const id = payload.sub;
    const email = payload.email;
    const displayName = payload.displayName;
    if (typeof id !== "string" || typeof email !== "string" || typeof displayName !== "string") {
      return null;
    }
    return { id, email, displayName };
  } catch {
    return null;
  }
}
function setSessionCookie(c, token) {
  setCookie(c, COOKIE, token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    secure: process.env.VERCEL === "1" || process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30
  });
}
function clearSessionCookie(c) {
  deleteCookie(c, COOKIE, { path: "/" });
}

// server/lib/careMath.ts
var CARE_ACTIONS = [
  "water",
  "prune",
  "sunlight",
  "sing",
  "deadhead"
];
var GROWING_AT = 6;
var MATURE_AT = 12;
var DRIFT_FLOOR = 8;
function clamp(n, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}
function stageFromCare(totalCare) {
  if (totalCare >= MATURE_AT) return "mature";
  if (totalCare >= GROWING_AT) return "growing";
  return "seedling";
}
function actionsForStage(stage) {
  switch (stage) {
    case "seedling":
      return ["water", "sunlight", "sing"];
    case "growing":
      return ["water", "sunlight", "sing", "prune"];
    case "mature":
      return [...CARE_ACTIONS];
  }
}
function isActionUnlocked(stage, action) {
  return actionsForStage(stage).includes(action);
}
function unlockHint(action, stage) {
  if (isActionUnlocked(stage, action)) return null;
  if (action === "prune") {
    return `Prune unlocks at growing (${GROWING_AT} care moments).`;
  }
  if (action === "deadhead") {
    return `Deadhead unlocks at mature (${MATURE_AT} care moments).`;
  }
  return "This care action is not available yet.";
}
function applyCare(mood, action) {
  const next = {
    ...mood,
    totalCare: mood.totalCare + 1
  };
  switch (action) {
    case "water":
      next.hydration = clamp(mood.hydration + 18);
      next.joy = clamp(mood.joy + 4);
      next.light = clamp(mood.light - 2);
      break;
    case "prune":
      next.neatness = clamp(mood.neatness + 16);
      next.joy = clamp(mood.joy + 3);
      next.hydration = clamp(mood.hydration - 3);
      break;
    case "sunlight":
      next.light = clamp(mood.light + 18);
      next.hydration = clamp(mood.hydration - 4);
      next.joy = clamp(mood.joy + 5);
      break;
    case "sing":
      next.joy = clamp(mood.joy + 14);
      next.neatness = clamp(mood.neatness + 2);
      break;
    case "deadhead":
      next.neatness = clamp(mood.neatness + 14);
      next.joy = clamp(mood.joy + 8);
      next.hydration = clamp(mood.hydration - 2);
      break;
  }
  return next;
}
function softFloor(mood) {
  return {
    hydration: clamp(mood.hydration, DRIFT_FLOOR, 100),
    neatness: clamp(mood.neatness, DRIFT_FLOOR, 100),
    light: clamp(mood.light, DRIFT_FLOOR, 100),
    joy: clamp(mood.joy, DRIFT_FLOOR, 100),
    totalCare: Math.max(0, mood.totalCare)
  };
}
function isCareAction(value) {
  return CARE_ACTIONS.includes(value);
}
var SEEDLING_DEFAULTS = {
  hydration: 42,
  neatness: 48,
  light: 44,
  joy: 40,
  totalCare: 0
};

// server/lib/db.ts
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import pg from "pg";
var databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
var pool;
var local;
function usingRemoteDb() {
  return databaseUrl !== "";
}
async function sql(text, params = []) {
  if (databaseUrl !== "") {
    pool ??= new pg.Pool({
      connectionString: databaseUrl,
      max: 5,
      ssl: process.env.PGSSLMODE === "disable" ? void 0 : { rejectUnauthorized: false }
    });
    return (await pool.query(text, params)).rows;
  }
  local ??= startLocal().catch((error) => {
    local = void 0;
    throw error;
  });
  const db = await local;
  const result = await db.query(text, params);
  return result.rows;
}
async function startLocal() {
  const spec = "@electric-sql/pglite";
  const { PGlite } = await import(
    /* @vite-ignore */
    spec
  );
  const db = new PGlite();
  const dir = join(process.cwd(), "migrations");
  const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    await db.exec(await readFile(join(dir, file), "utf8"));
  }
  return db;
}

// server/lib/plants.ts
function normalizeStage(scope, totalCare, raw) {
  if (scope === "global") return "mature";
  const fromCare = stageFromCare(totalCare);
  if (raw === "seedling" || raw === "growing" || raw === "mature") {
    const order = { seedling: 0, growing: 1, mature: 2 };
    return order[fromCare] >= order[raw] ? fromCare : raw;
  }
  return fromCare;
}
function mapRow(row) {
  const mood = softFloor({
    hydration: Number(row.hydration),
    neatness: Number(row.neatness),
    light: Number(row.light),
    joy: Number(row.joy),
    totalCare: Number(row.total_care)
  });
  const growthStage = normalizeStage(row.scope, mood.totalCare, row.growth_stage);
  return {
    id: row.id,
    scope: row.scope,
    ...mood,
    growthStage,
    unlockedActions: growthStage === "mature" ? ["water", "prune", "sunlight", "sing", "deadhead"] : growthStage === "growing" ? ["water", "sunlight", "sing", "prune"] : ["water", "sunlight", "sing"],
    updatedAt: new Date(row.updated_at).toISOString()
  };
}
var SELECT_MOOD = `select id, scope, hydration, neatness, light, joy, total_care,
  coalesce(growth_stage, 'seedling') as growth_stage, updated_at
  from plant_moods`;
async function getGlobalPlant() {
  const rows = await sql(`${SELECT_MOOD} where id = 'global'`);
  if (rows[0]) return mapRow(rows[0]);
  await sql(
    `insert into plant_moods (id, scope, growth_stage)
     values ('global', 'global', 'mature')
     on conflict (id) do nothing`
  );
  const again = await sql(`${SELECT_MOOD} where id = 'global'`);
  return mapRow(again[0]);
}
async function getPersonalPlant(userId) {
  const rows = await sql(
    `${SELECT_MOOD} where id = $1 and scope = 'personal'`,
    [userId]
  );
  if (rows[0]) return mapRow(rows[0]);
  await sql(
    `insert into plant_moods (
       id, scope, user_id, hydration, neatness, light, joy, total_care, growth_stage
     ) values ($1, 'personal', $2, $3, $4, $5, $6, 0, 'seedling')
     on conflict (id) do nothing`,
    [
      userId,
      userId,
      SEEDLING_DEFAULTS.hydration,
      SEEDLING_DEFAULTS.neatness,
      SEEDLING_DEFAULTS.light,
      SEEDLING_DEFAULTS.joy
    ]
  );
  const again = await sql(`${SELECT_MOOD} where id = $1`, [userId]);
  return mapRow(again[0]);
}
async function applyPlantCare(opts) {
  const current = opts.scope === "global" ? await getGlobalPlant() : await getPersonalPlant(opts.plantId);
  if (opts.scope === "personal" && !isActionUnlocked(current.growthStage, opts.action)) {
    const hint = unlockHint(opts.action, current.growthStage);
    throw new CareLockedError(hint || "Action locked until your plant grows.");
  }
  const next = applyCare(current, opts.action);
  const growthStage = opts.scope === "global" ? "mature" : stageFromCare(next.totalCare);
  await sql(
    `update plant_moods
     set hydration = $2, neatness = $3, light = $4, joy = $5,
         total_care = $6, growth_stage = $7, updated_at = now()
     where id = $1`,
    [
      opts.plantId,
      next.hydration,
      next.neatness,
      next.light,
      next.joy,
      next.totalCare,
      growthStage
    ]
  );
  await sql(
    `insert into care_events (id, user_id, plant_scope, plant_id, action)
     values ($1, $2, $3, $4, $5)`,
    [crypto.randomUUID(), opts.userId, opts.scope, opts.plantId, opts.action]
  );
  return {
    id: opts.plantId,
    scope: opts.scope,
    ...next,
    growthStage,
    unlockedActions: mapRow({
      id: opts.plantId,
      scope: opts.scope,
      hydration: next.hydration,
      neatness: next.neatness,
      light: next.light,
      joy: next.joy,
      total_care: next.totalCare,
      growth_stage: growthStage,
      updated_at: /* @__PURE__ */ new Date()
    }).unlockedActions,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function mirrorPersonalCareToGlobal(opts) {
  return applyPlantCare({
    scope: "global",
    plantId: "global",
    userId: opts.userId,
    action: opts.action
  });
}
var CareLockedError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "CareLockedError";
  }
};
async function signupCount() {
  const rows = await sql(
    "select count(*)::int as count from users"
  );
  return Number(rows[0]?.count ?? 0);
}
async function careTotals() {
  const rows = await sql(
    `select plant_scope, count(*)::int as count
     from care_events
     group by plant_scope`
  );
  const out = { globalCareEvents: 0, personalCareEvents: 0 };
  for (const row of rows) {
    if (row.plant_scope === "global") out.globalCareEvents = Number(row.count);
    if (row.plant_scope === "personal") {
      out.personalCareEvents = Number(row.count);
    }
  }
  return out;
}

// server/lib/rateLimit.ts
var WINDOW_MS = 60 * 60 * 1e3;
async function takeRateLimit(bucket, maxHits) {
  const rows = await sql("select hits, window_start from rate_limits where bucket = $1", [bucket]);
  const now = Date.now();
  if (rows.length === 0) {
    await sql(
      "insert into rate_limits (bucket, hits, window_start) values ($1, 1, now())",
      [bucket]
    );
    return { ok: true, remaining: maxHits - 1 };
  }
  const row = rows[0];
  const start = new Date(row.window_start).getTime();
  if (Number.isNaN(start) || now - start > WINDOW_MS) {
    await sql(
      "update rate_limits set hits = 1, window_start = now() where bucket = $1",
      [bucket]
    );
    return { ok: true, remaining: maxHits - 1 };
  }
  if (row.hits >= maxHits) {
    return { ok: false, remaining: 0 };
  }
  await sql("update rate_limits set hits = hits + 1 where bucket = $1", [bucket]);
  return { ok: true, remaining: maxHits - row.hits - 1 };
}
function clientKey(c) {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return c.req.header("x-real-ip") || "local";
}

// server/app.ts
var signupSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
  displayName: z.string().trim().min(2).max(40)
});
var loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200)
});
var careSchema = z.object({
  action: z.string(),
  scope: z.enum(["global", "personal"])
});
var app = new Hono().basePath("/api");
app.use(
  "*",
  cors({
    origin: (origin) => origin || "*",
    credentials: true
  })
);
app.get(
  "/health",
  (c) => c.json({
    ok: true,
    db: usingRemoteDb() ? "postgres" : "pglite",
    auth: authConfigured()
  })
);
app.get("/me", async (c) => {
  const user = await readSession(c);
  if (!user) return c.json({ user: null });
  const plant = await getPersonalPlant(user.id);
  return c.json({ user, plant });
});
app.post("/auth/signup", async (c) => {
  if (!authConfigured()) {
    return c.json(
      { error: "Auth is not configured. Set SESSION_SECRET (16+ chars)." },
      503
    );
  }
  const body = signupSchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) {
    return c.json({ error: "Invalid signup details." }, 400);
  }
  const limit = await takeRateLimit(`signup:${clientKey(c)}`, 8);
  if (!limit.ok) return c.json({ error: "Too many signups from this network." }, 429);
  const email = body.data.email.toLowerCase();
  const existing = await sql("select id from users where email = $1", [email]);
  if (existing.length) {
    return c.json({ error: "An account with that email already exists." }, 409);
  }
  const passwordHash = await hashPassword(body.data.password);
  const id = crypto.randomUUID();
  const rows = await sql(
    `insert into users (id, email, password_hash, display_name)
     values ($1, $2, $3, $4)
     returning id, email, display_name`,
    [id, email, passwordHash, body.data.displayName]
  );
  const created = rows[0];
  await getPersonalPlant(created.id);
  const user = {
    id: created.id,
    email: created.email,
    displayName: created.display_name
  };
  const token = await createSessionToken(user);
  setSessionCookie(c, token);
  const plant = await getPersonalPlant(user.id);
  const roots = await signupCount();
  return c.json({ user, plant, signupCount: roots }, 201);
});
app.post("/auth/login", async (c) => {
  if (!authConfigured()) {
    return c.json(
      { error: "Auth is not configured. Set SESSION_SECRET (16+ chars)." },
      503
    );
  }
  const body = loginSchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) return c.json({ error: "Invalid login details." }, 400);
  const limit = await takeRateLimit(`login:${clientKey(c)}`, 20);
  if (!limit.ok) return c.json({ error: "Too many login attempts." }, 429);
  const email = body.data.email.toLowerCase();
  const rows = await sql(
    `select id, email, display_name, password_hash from users where email = $1`,
    [email]
  );
  const row = rows[0];
  if (!row || !await verifyPassword(body.data.password, row.password_hash)) {
    return c.json({ error: "Email or password is incorrect." }, 401);
  }
  const user = {
    id: row.id,
    email: row.email,
    displayName: row.display_name
  };
  const token = await createSessionToken(user);
  setSessionCookie(c, token);
  const plant = await getPersonalPlant(user.id);
  return c.json({ user, plant });
});
app.post("/auth/logout", async (c) => {
  clearSessionCookie(c);
  return c.json({ ok: true });
});
app.get("/plants/global", async (c) => {
  const plant = await getGlobalPlant();
  return c.json({ plant });
});
app.get("/plants/personal", async (c) => {
  const user = await readSession(c);
  if (!user) return c.json({ error: "Sign in to tend your own Zenna." }, 401);
  const plant = await getPersonalPlant(user.id);
  return c.json({ plant });
});
app.post("/care", async (c) => {
  const body = careSchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success || !isCareAction(body.data.action)) {
    return c.json({ error: "Unknown care action." }, 400);
  }
  const user = await readSession(c);
  try {
    if (body.data.scope === "personal") {
      if (!user) {
        return c.json({ error: "Sign in to tend your own Zenna." }, 401);
      }
      const limit = await takeRateLimit(`care:personal:${user.id}`, 240);
      if (!limit.ok) {
        return c.json(
          { error: "Easy \u2014 give your seedling a short rest." },
          429
        );
      }
      const plant2 = await applyPlantCare({
        scope: "personal",
        plantId: user.id,
        userId: user.id,
        action: body.data.action
      });
      const global = await mirrorPersonalCareToGlobal({
        userId: user.id,
        action: body.data.action
      });
      return c.json({ plant: plant2, global });
    }
    const plant = await applyPlantCare({
      scope: "global",
      plantId: "global",
      userId: user?.id ?? null,
      action: body.data.action
    });
    return c.json({ plant });
  } catch (error) {
    if (error instanceof CareLockedError || error instanceof Error && error.name === "CareLockedError") {
      return c.json(
        { error: error instanceof Error ? error.message : "Action locked." },
        403
      );
    }
    throw error;
  }
});
app.get("/stats/roots", async (c) => {
  const count = await signupCount();
  const totals = await careTotals();
  return c.json({ signupCount: count, ...totals });
});
app.get("/stats/compete", async (c) => {
  const user = await readSession(c);
  const global = await getGlobalPlant();
  const totals = await careTotals();
  const personal = user ? await getPersonalPlant(user.id) : null;
  return c.json({
    global,
    personal,
    totals,
    user: user ? { id: user.id, displayName: user.displayName, email: user.email } : null
  });
});
app.onError((err, c) => {
  console.error("[zenna-api]", err);
  return c.json({ error: "Something wilted on the server." }, 500);
});
var app_default = app;
export {
  app,
  app_default as default
};
