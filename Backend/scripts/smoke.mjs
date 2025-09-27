// scripts/smoke.mjs
// Usando fetch nativo de Node (no hace falta node-fetch)

const BASE = process.env.API_BASE || "http://localhost:4000";
const email = process.env.SMOKE_EMAIL || "admin@tiendabarrios.com";
const password = process.env.SMOKE_PASSWORD || "123456";

// Ruta protegida de prueba
const protectedMethod = "GET";
const protectedPath = "/stores"; // cámbiala si necesitas otro endpoint

const pretty = (x) => JSON.stringify(x, null, 2);

const step = async (name, fn) => {
  process.stdout.write(`\n▶ ${name}...\n`);
  try {
    const res = await fn();
    console.log("✓ OK");
    return res;
  } catch (e) {
    console.error("✗ FAIL");
    throw e;
  }
};

const req = async (method, path, body, headers = {}) => {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, headers: Object.fromEntries(res.headers), body: json };
};

try {
  // 1) /health sin token
  const health = await step("HEALTH", () => req("GET", "/health"));
  console.log(pretty(health));

  // 2) login
  const login = await step("LOGIN", () =>
    req("POST", "/auth/login", { email, password })
  );
  console.log(pretty(login));

  if (!login.body?.token) {
    throw new Error(
      "El login NO devolvió token. El problema está en el controlador de login o en JWT_SECRET."
    );
  }

  const token = login.body.token;

  // 3) ruta protegida SIN token
  const noAuth = await step("PROTECTED sin token", () =>
    req(protectedMethod, protectedPath)
  );
  console.log(pretty(noAuth));

  // 4) ruta protegida CON token
  const withAuth = await step("PROTECTED con token", () =>
    req(protectedMethod, protectedPath, null, { Authorization: `Bearer ${token}` })
  );
  console.log(pretty(withAuth));

  // 5) token corrupto
  const badAuth = await step("PROTECTED con token inválido", () =>
    req(protectedMethod, protectedPath, null, { Authorization: "Bearer xxx.yyy.zzz" })
  );
  console.log(pretty(badAuth));
} catch (e) {
  console.error("\n==== DIAGNÓSTICO ====");
  console.error(e?.message || e);
  console.error(
    "Sospechas: \n- JWT_SECRET ausente/incorrecto\n- login no firma ni devuelve token\n- middleware no lee 'Authorization: Bearer ...'\n- reloj del sistema fuera de hora (exp de JWT)"
  );
  process.exit(1);
}
