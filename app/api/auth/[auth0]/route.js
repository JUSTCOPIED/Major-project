import { handleAuth } from '@auth0/nextjs-auth0';

export async function GET(req) {
  return handleAuth()(req);
}

export async function POST(req) {
  return handleAuth()(req);
}