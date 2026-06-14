import { redirect } from "next/navigation";
import { getPlayers, getEvents } from "@/lib/data";
import { getActiveGroupId } from "@/lib/session";
import coursesData from "@/data/courses.json";
import ScoresClient from "./ScoresClient";

export const dynamic = "force-dynamic";

export default async function ScoresPage() {
  const groupId = await getActiveGroupId();
  if (!groupId) redirect("/");
  const players = await getPlayers(groupId);
  const courses = coursesData as { id: string; name: string }[];
  // course 以外のフィールドだけを Client に渡す
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const events = (await getEvents(groupId)).map(({ course, ...e }) => e);

  return <ScoresClient players={players} courses={courses} events={events} />;
}
