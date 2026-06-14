import { getPlayers, getEvents } from "@/lib/data";
import coursesData from "@/data/courses.json";
import ScoresClient from "./ScoresClient";

export const dynamic = "force-dynamic";

export default async function ScoresPage() {
  const players = await getPlayers();
  const courses = coursesData as { id: string; name: string }[];
  // course 以外のフィールドだけを Client に渡す
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const events = (await getEvents()).map(({ course, ...e }) => e);

  return <ScoresClient players={players} courses={courses} events={events} />;
}
