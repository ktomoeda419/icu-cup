import { supabase } from "@/lib/supabase";

export default async function EventPhotos({ params }: { params: { id: string } }) {
  const eventId = params.id;

  const { data: event } = await supabase
    .from("events")
    .select("id,name,event_date")
    .eq("id", eventId)
    .single();

  if (!event) return <main style={{ padding: 24 }}>Event not found</main>;

  const { data: photos, error } = await supabase
    .from("photos")
    .select("id,url,caption,created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) return <main style={{ padding: 24 }}>Error: {error.message}</main>;

  return (
    <main style={{ padding: 24 }}>
      <h1>{event.name} 写真</h1>
      <p>{event.event_date}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {(photos || []).map((p: any) => (
          <figure key={p.id} style={{ border: "1px solid #ddd", padding: 8 }}>
            {/* 画像URLが直リンク前提。将来はStorageのpublic URLでもOK */}
            <img src={p.url} alt={p.caption || "photo"} style={{ width: "100%", height: "auto" }} />
            {p.caption && <figcaption style={{ marginTop: 6, color: "#555" }}>{p.caption}</figcaption>}
          </figure>
        ))}
        {(photos || []).length === 0 && (
          <p style={{ color: "#666" }}>まだ写真がありません</p>
        )}
      </div>
    </main>
  );
}
