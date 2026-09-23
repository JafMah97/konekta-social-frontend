import { cookies } from "next/headers";

// Drops a token cookie the API no longer accepts (revoked or expired session).
// The API's own /auth/logout requires a valid session, so it can't do this,
// and without it the route guard in proxy.ts would keep treating the visitor
// as signed in.
export async function DELETE() {
  (await cookies()).delete("token");
  return new Response(null, { status: 204 });
}
