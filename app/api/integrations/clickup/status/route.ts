import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    configured: Boolean(process.env.CLICKUP_API_TOKEN),
    workspaceConfigured: Boolean(process.env.CLICKUP_WORKSPACE_ID || '9018782844'),
    workspaceId: process.env.CLICKUP_WORKSPACE_ID ?? '9018782844',
  });
}
