import Link from "next/link";
import { getEvents } from "@/lib/data";

export default function EventsPage() {
  const events = getEvents();

  return (
    <main style={{ padding: 24 }}>
      <h1>Events</h1>
      <ul style={{ paddingLeft: 18 }}>
        {events.map((e) => (
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
