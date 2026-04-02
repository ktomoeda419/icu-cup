import playersData from "@/data/players.json";
import coursesData from "@/data/courses.json";
import eventsData from "@/data/events.json";

export type Gender = "M" | "F";

export type Player = {
  id: string;
  name: string;
  gender: Gender;
  aliases: string[];
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

const players = playersData as Player[];
const courses = coursesData as Course[];
const events = eventsData as Event[];

export function getPlayers(): Player[] {
  return [...players].sort((a, b) => a.name.localeCompare(b.name, "ja"));
}

export function getPlayer(id: string): Player | null {
  return players.find((p) => p.id === id) ?? null;
}

export function getCourse(id: string): Course | null {
  return courses.find((c) => c.id === id) ?? null;
}

export function getEvents(): (Event & { course: Course | null })[] {
  return [...events]
    .sort((a, b) => b.event_date.localeCompare(a.event_date))
    .map((e) => ({ ...e, course: getCourse(e.course_id) }));
}

export function getEvent(id: string): (Event & { course: Course | null }) | null {
  const e = events.find((e) => e.id === id) ?? null;
  if (!e) return null;
  return { ...e, course: getCourse(e.course_id) };
}

export function getScoresForEvent(
  eventId: string
): (Score & { player: Player | null })[] {
  const e = events.find((e) => e.id === eventId);
  if (!e) return [];
  return e.scores.map((s) => ({ ...s, player: getPlayer(s.player_id) }));
}

export function getScoresForPlayer(
  playerId: string
): (Score & { event: Event & { course: Course | null } })[] {
  const result: (Score & { event: Event & { course: Course | null } })[] = [];
  for (const e of events) {
    const score = e.scores.find((s) => s.player_id === playerId);
    if (score) {
      result.push({ ...score, event: { ...e, course: getCourse(e.course_id) } });
    }
  }
  return result.sort((a, b) =>
    a.event.event_date.localeCompare(b.event.event_date)
  );
}

export function getPastScoresForPlayer(
  playerId: string,
  beforeDate: string
): (Score & { event: Event & { course: Course | null } })[] {
  return getScoresForPlayer(playerId).filter(
    (s) => s.event.event_date < beforeDate
  );
}
