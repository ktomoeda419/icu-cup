import { sql } from "@vercel/postgres";
import coursesData from "@/data/courses.json";

export type Gender = "M" | "F";

export type Player = {
  id: string;
  name: string;
  gender: Gender;
  aliases: string[];
  initial_hc: number | null;
};

export type Course = {
  id: string;
  name: string;
  regular_course_rating: number;
  regular_slope: number;
  red_course_rating: number;
  red_slope: number;
};

export type Score = {
  player_id: string;
  out_score: number | null;
  in_score: number | null;
  total_score: number;
};

export type Event = {
  id: string;
  name: string;
  event_date: string;
  course_id: string;
  scores: Score[];
};

const courses = coursesData as Course[];

export function getCourse(id: string): Course | null {
  return courses.find((c) => c.id === id) ?? null;
}

export async function getPlayers(): Promise<Player[]> {
  const { rows } = await sql`
    SELECT id, name, gender, aliases, initial_hc FROM players ORDER BY name
  `;
  return rows as Player[];
}

export async function getPlayer(id: string): Promise<Player | null> {
  const { rows } = await sql`
    SELECT id, name, gender, aliases, initial_hc FROM players WHERE id = ${id}
  `;
  return (rows[0] as Player) ?? null;
}

export async function getEvents(): Promise<(Event & { course: Course | null })[]> {
  const { rows: eventRows } = await sql`
    SELECT id, name, event_date, course_id FROM events ORDER BY event_date DESC
  `;

  const { rows: scoreRows } = await sql`
    SELECT event_id, player_id, out_score, in_score, total_score FROM scores
  `;

  return eventRows.map((e) => ({
    id: e.id,
    name: e.name,
    event_date: e.event_date,
    course_id: e.course_id,
    scores: scoreRows
      .filter((s) => s.event_id === e.id)
      .map((s) => ({
        player_id: s.player_id,
        out_score: s.out_score,
        in_score: s.in_score,
        total_score: s.total_score,
      })),
    course: getCourse(e.course_id),
  }));
}

export async function getEvent(
  id: string
): Promise<(Event & { course: Course | null }) | null> {
  const { rows } = await sql`
    SELECT id, name, event_date, course_id FROM events WHERE id = ${id}
  `;
  if (!rows[0]) return null;

  const e = rows[0];
  const { rows: scoreRows } = await sql`
    SELECT player_id, out_score, in_score, total_score FROM scores WHERE event_id = ${id}
  `;

  return {
    id: e.id,
    name: e.name,
    event_date: e.event_date,
    course_id: e.course_id,
    scores: scoreRows as Score[],
    course: getCourse(e.course_id),
  };
}

export async function getScoresForEvent(
  eventId: string
): Promise<(Score & { player: Player | null })[]> {
  const { rows } = await sql`
    SELECT
      s.player_id, s.out_score, s.in_score, s.total_score,
      p.id AS p_id, p.name AS p_name, p.gender AS p_gender, p.aliases AS p_aliases, p.initial_hc AS p_initial_hc
    FROM scores s
    LEFT JOIN players p ON s.player_id = p.id
    WHERE s.event_id = ${eventId}
  `;

  return rows.map((r) => ({
    player_id: r.player_id,
    out_score: r.out_score,
    in_score: r.in_score,
    total_score: r.total_score,
    player: r.p_id
      ? { id: r.p_id, name: r.p_name, gender: r.p_gender as Gender, aliases: r.p_aliases, initial_hc: r.p_initial_hc ?? null }
      : null,
  }));
}

export async function getScoresForPlayer(
  playerId: string
): Promise<(Score & { event: Event & { course: Course | null } })[]> {
  const { rows } = await sql`
    SELECT
      s.player_id, s.out_score, s.in_score, s.total_score,
      e.id AS event_id, e.name AS event_name, e.event_date, e.course_id
    FROM scores s
    JOIN events e ON s.event_id = e.id
    WHERE s.player_id = ${playerId}
    ORDER BY e.event_date ASC
  `;

  return rows.map((r) => ({
    player_id: r.player_id,
    out_score: r.out_score,
    in_score: r.in_score,
    total_score: r.total_score,
    event: {
      id: r.event_id,
      name: r.event_name,
      event_date: r.event_date,
      course_id: r.course_id,
      scores: [],
      course: getCourse(r.course_id),
    },
  }));
}

export async function getPastScoresForPlayer(
  playerId: string,
  beforeDate: string
): Promise<(Score & { event: Event & { course: Course | null } })[]> {
  const scores = await getScoresForPlayer(playerId);
  return scores.filter((s) => s.event.event_date < beforeDate);
}
