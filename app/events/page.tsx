import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function EventsPage() {
  const { data: events, error } = await supabase
    .from("events")
    .select("id,name,event_date")
    .order("event_date", { ascending: false });

  if (error) return <main style={{ padding: 24 }}>Error: {error.message}</main>;

  return (
    <main style={{ padding: 24 }}>
      <h1>Events</h1>
      <ul style={{ paddingLeft: 18 }}>
        {(events || []).map((e) => (
          <li key={e.id} style={{ margin: "8px 0" }}>
            <Link href={`/events/${e.id}`} style={{ textDecoration: "none" }}>
              {e.name}
            </Link>{" "}
            <span style={{ color: "#666" }}>{e.event_date ?? ""}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
