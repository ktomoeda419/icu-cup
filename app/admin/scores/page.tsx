import { getPlayers, getEvents } from "@/lib/data";
import coursesData from "@/data/courses.json";
import ScoresClient from "./ScoresClient";

export default function ScoresPage() {
  const players = getPlayers();
  const courses = coursesData as { id: string; name: string }[];
  const events = getEvents().map(({ course, ...e }) => e);

  return <ScoresClient players={players} courses={courses} events={events} />;
}
