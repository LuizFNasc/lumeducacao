import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "lumeducacao_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias
const MAGIC_LINK_DURATION_MS = 15 * 60 * 1000; // 15 minutos

function generateToken() {
  return randomBytes(32).toString("hex");
}

/**
 * Cria um token de login de uso único para o e-mail informado. Ainda não
 * há provedor de e-mail configurado (Resend/SMTP) — por enquanto o "envio"
 * é simulado: a própria página de confirmação mostra o link, do mesmo jeito
 * que o checkout fictício simula o webhook de pagamento. Trocar por e-mail
 * de verdade no futuro não muda esse token nem o restante do fluxo.
 */
export async function requestMagicLink(email: string) {
  const token = generateToken();
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + MAGIC_LINK_DURATION_MS),
    },
  });
  return token;
}

export async function consumeMagicLink(token: string) {
  const verification = await prisma.verificationToken.findUnique({ where: { token } });
  if (!verification || verification.expires < new Date()) {
    if (verification) {
      await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    }
    return null;
  }

  await prisma.verificationToken.delete({ where: { token } });

  const user = await prisma.user.upsert({
    where: { email: verification.identifier },
    update: {},
    create: { email: verification.identifier },
  });

  return createSession(user.id);
}

export async function createSession(userId: string) {
  const session = await prisma.session.create({
    data: {
      sessionToken: generateToken(),
      userId,
      expires: new Date(Date.now() + SESSION_DURATION_MS),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, session.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: session.expires,
  });

  return session;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session || session.expires < new Date()) return null;

  return session.user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (sessionToken) {
    await prisma.session.deleteMany({ where: { sessionToken } });
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}
