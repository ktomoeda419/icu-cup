import { getPlayers, getEvents } from "@/lib/data";
import coursesData from "@/data/courses.json";
import ScoresClient from "./ScoresClient";

export const dynamic = "force-dynamic";

export default async function ScoresPage() {
  const players = await getPlayers();
  const courses = coursesData as { id: string; name: string }[];
  const events = (await getEvents()).map(({ course, ...e }) => e);

  return <ScoresClient players={players} courses={courses} events={events} />;
}
