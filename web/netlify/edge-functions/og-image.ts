import type { Config, Context } from "@netlify/edge-functions"
import { ImageResponse } from "https://deno.land/x/og_edge/mod.ts"
import React from "https://esm.sh/react@18.2.0"

export const config: Config = {
  path: "/.netlify/edge-functions/og-image",
}

export default async (request: Request, context: Context) => {
  try {
    const url = new URL(request.url)
    const scoreboardId = url.searchParams.get("id")

    if (!scoreboardId) {
      return new Response("Missing scoreboard ID", { status: 400 })
    }

    // Fetch scoreboard data from Supabase
    const supabaseUrl = Deno.env.get("VITE_SUPABASE_URL") || Deno.env.get("SUPABASE_URL")
    const supabaseKey = Deno.env.get("VITE_SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_ANON_KEY")

    if (!supabaseUrl || !supabaseKey) {
      return new Response("Server configuration error", { status: 500 })
    }

    // Fetch scoreboard data
    const scoreboardResponse = await fetch(
      `${supabaseUrl}/rest/v1/scoreboards?id=eq.${scoreboardId}&select=*`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    )

    if (!scoreboardResponse.ok) {
      return new Response("Scoreboard not found", { status: 404 })
    }

    const scoreboards = await scoreboardResponse.json()
    const scoreboard = scoreboards[0]

    if (!scoreboard) {
      return new Response("Scoreboard not found", { status: 404 })
    }

    // Fetch teams
    const teamsResponse = await fetch(
      `${supabaseUrl}/rest/v1/teams?scoreboard_id=eq.${scoreboardId}&select=*`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    )

    const teams = await teamsResponse.json() || []

    // Fetch quarters for score calculation
    const teamIds = teams.map((t: any) => t.id)
    let quarters: any[] = []
    if (teamIds.length > 0) {
      const quartersResponse = await fetch(
        `${supabaseUrl}/rest/v1/quarters?team_id=in.(${teamIds.join(",")})&select=*`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      )
      quarters = await quartersResponse.json() || []
    }

    const team0 = teams[0]
    const team1 = teams[1]
    const team0Name = team0?.name || "Team 1"
    const team1Name = team1?.name || "Team 2"

    const getTeamTotalScore = (teamId: string) => {
      return quarters
        .filter((q: any) => q.team_id === teamId)
        .reduce((sum: number, q: any) => sum + (q.points || 0), 0)
    }

    const score0 = team0 ? getTeamTotalScore(team0.id) : 0
    const score1 = team1 ? getTeamTotalScore(team1.id) : 0

    // Generate the image using og_edge with React.createElement
    return new ImageResponse(
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            backgroundColor: "#ffffff",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
          },
        },
        // Title
        React.createElement(
          "div",
          {
            style: {
              fontSize: 48,
              fontWeight: "bold",
              color: "#111827",
              marginBottom: 40,
            },
          },
          `${team0Name} vs ${team1Name}`
        ),
        // Scores container
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "row",
              gap: 80,
              alignItems: "center",
            },
          },
          // Team 0 score
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              },
            },
            React.createElement(
              "div",
              {
                style: {
                  fontSize: 120,
                  fontWeight: "bold",
                  color: team0?.color || "#ef4444",
                },
              },
              score0.toString()
            ),
            React.createElement(
              "div",
              {
                style: {
                  fontSize: 24,
                  color: "#6b7280",
                  marginTop: 8,
                },
              },
              team0Name
            )
          ),
          // Dash
          React.createElement(
            "div",
            {
              style: {
                fontSize: 48,
                color: "#9ca3af",
                fontWeight: "bold",
              },
            },
            "-"
          ),
          // Team 1 score
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              },
            },
            React.createElement(
              "div",
              {
                style: {
                  fontSize: 120,
                  fontWeight: "bold",
                  color: team1?.color || "#3b82f6",
                },
              },
              score1.toString()
            ),
            React.createElement(
              "div",
              {
                style: {
                  fontSize: 24,
                  color: "#6b7280",
                  marginTop: 8,
                },
              },
              team1Name
            )
          )
        ),
        // Branding
        React.createElement(
          "div",
          {
            style: {
              fontSize: 24,
              color: "#6b7280",
              marginTop: 60,
            },
          },
          "Pretty Scoreboard"
        )
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error("Error generating OG image:", error)
    return new Response("Error generating image", { status: 500 })
  }
}
