import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CLICKUP_API_URL = 'https://api.clickup.com/api/v2';

export async function GET() {
  const token = process.env.CLICKUP_API_TOKEN;
  const workspaceId = process.env.CLICKUP_WORKSPACE_ID ?? '9018782844';

  if (!token) {
    return NextResponse.json({
      configured: false,
      workspaceConfigured: true,
      workspaceId,
      apiReachable: false,
      apiStatus: null,
      message: 'CLICKUP_API_TOKEN is not available to the production runtime.',
    });
  }

  try {
    const response = await fetch(`${CLICKUP_API_URL}/team`, {
      headers: { Authorization: token },
      cache: 'no-store',
    });

    let workspaceVisible = false;
    let teamCount = 0;

    if (response.ok) {
      const payload = (await response.json()) as { teams?: Array<{ id?: string }> };
      const teams = payload.teams ?? [];
      teamCount = teams.length;
      workspaceVisible = teams.some((team) => team.id === workspaceId);
    }

    return NextResponse.json({
      configured: true,
      workspaceConfigured: true,
      workspaceId,
      apiReachable: response.ok,
      apiStatus: response.status,
      teamCount,
      workspaceVisible,
      message: response.ok
        ? workspaceVisible
          ? 'ClickUp API connection is valid and the configured workspace is accessible.'
          : 'ClickUp API connection is valid, but the configured workspace was not returned for this token.'
        : `ClickUp API authentication check returned ${response.status}.`,
    });
  } catch (error) {
    return NextResponse.json({
      configured: true,
      workspaceConfigured: true,
      workspaceId,
      apiReachable: false,
      apiStatus: null,
      workspaceVisible: false,
      message: error instanceof Error ? error.message : 'Unable to reach ClickUp API.',
    });
  }
}
