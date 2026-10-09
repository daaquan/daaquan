export const dynamic = 'force-static';

export function GET() {
  return Response.json({ release: process.env.SITE_RELEASE ?? 'development', stack: 'next-static-export', theme: 'neobrutalism-application' });
}
