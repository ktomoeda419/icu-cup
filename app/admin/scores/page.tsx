import { getPlayers } from "@/lib/data";
import coursesData from "@/data/courses.json";
import ScoresClient from "./ScoresClient";

export default function ScoresPage() {
  const players = getPlayers();
  const courses = coursesData as { id: string; name: string }[];

  return <ScoresClient players={players} courses={courses} />;
}
