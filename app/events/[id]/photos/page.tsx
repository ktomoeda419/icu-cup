import { getEvent } from "@/lib/data";

export default async function EventPhotos({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = await params;

  const event = getEvent(eventId);
  if (!event) return <main style={{ padding: 24 }}>Event not found</main>;

  return (
    <main style={{ padding: 24 }}>
      <h1>{event.name} 写真</h1>
      <p>{event.event_date}</p>
      <p style={{ color: "#666" }}>まだ写真がありません</p>
    </main>
  );
}
