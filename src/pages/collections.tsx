import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Collection {
  id: string;
  name: string;
  created_at: string;
}

export default function Collections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  async function fetchCollections() {
    setLoading(true);
    const { data, error: sbError } = await supabase
      .from("collections")
      .select("id, name, created_at")
      .order("created_at", { ascending: false });
    if (sbError) {
      setError("Failed to load collections.");
    } else {
      setCollections(data ?? []);
    }
    setLoading(false);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }
    const { error: sbError } = await supabase
      .from("collections")
      .insert({ name: newName.trim(), user_id: user.id });
    if (sbError) {
      setError("Failed to create collection.");
    } else {
      setNewName("");
      setShowCreate(false);
      fetchCollections();
    }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("collections").delete().eq("id", id);
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="min-h-screen w-full" style={{ background: "hsl(222 16% 10%)" }}>
      <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-8">

        <header className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <a href="/check" style={{ textDecoration: "none" }}>
                <span
                  className="inline-flex items-center justify-center rounded-lg w-8 h-8 text-sm font-bold"
                  style={{ background: "hsl(210 80% 60%)", color: "hsl(222 16% 6%)" }}
                >P</span>
              </a>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: "hsl(210 20% 92%)" }}>
                My Collections
              </h1>
            </div>
            <button
              onClick={() => setShowCreate((v) => !v)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: "hsl(210 80% 60%)", color: "hsl(222 16% 6%)", border: "none", cursor: "pointer" }}
            >
              + New
            </button>
          </div>
          <p className="text-sm" style={{ color: "hsl(215 14% 55%)" }}>
            Your saved code checks, organised into collections.
          </p>
        </header>

        {showCreate && (
          <div
            className="rounded-xl p-4 flex flex-col gap-3 mb-4"
            style={{ background: "hsl(222 16% 13%)", border: "1px solid hsl(220 13% 26%)" }}
          >
            <p className="text-xs font-medium" style={{ color: "hsl(210 20% 72%)" }}>New collection</p>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="e.g. React components, Python scripts..."
              autoFocus
              className="w-full outline-none text-sm px-4 py-2.5 rounded-lg"
              style={{
                background: "hsl(222 16% 12%)",
                color: "hsl(210 20% 88%)",
                border: "1px solid hsl(220 13% 22%)",
                caretColor: "hsl(210 80% 60%)",
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="flex-1 rounded-lg py-2 text-xs font-semibold"
                style={{
                  background: newName.trim() ? "hsl(210 80% 60%)" : "hsl(220 13% 20%)",
                  color: newName.trim() ? "hsl(222 16% 6%)" : "hsl(215 14% 40%)",
                  border: "none",
                  cursor: newName.trim() ? "pointer" : "not-allowed",
                }}
              >
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                onClick={() => { setShowCreate(false); setNewName(""); }}
                className="px-4 rounded-lg py-2 text-xs"
                style={{ background: "hsl(220 13% 18%)", color: "hsl(215 14% 55%)", border: "1px solid hsl(220 13% 26%)", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm flex items-center gap-2 mb-4"
            style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)", color: "rgb(253,224,71)" }}
          >
            <span>⚠</span><span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-sm text-center py-12" style={{ color: "hsl(215 14% 45%)" }}>
            Loading...
          </div>
        ) : collections.length === 0 ? (
          <div
            className="rounded-xl px-4 py-10 text-center flex flex-col items-center gap-2"
            style={{ background: "hsl(222 16% 13%)", border: "1px solid hsl(220 13% 22%)" }}
          >
            <span style={{ fontSize: "1.75rem" }}>📁</span>
            <p className="text-sm font-medium" style={{ color: "hsl(210 20% 72%)" }}>No collections yet</p>
            <p className="text-xs" style={{ color: "hsl(215 14% 45%)" }}>
              Create a collection, then save checks to it from the results panel.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {collections.map((col) => (
              <div
                key={col.id}
                className="rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ background: "hsl(222 16% 13%)", border: "1px solid hsl(220 13% 22%)" }}
              >
                <a
                  href={`/collections/${col.id}`}
                  style={{ textDecoration: "none", flex: 1, minWidth: 0 }}
                >
                  <p className="text-sm font-medium truncate" style={{ color: "hsl(210 20% 88%)" }}>
                    {col.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "hsl(215 14% 45%)" }}>
                    {new Date(col.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </a>
                <button
                  onClick={() => handleDelete(col.id)}
                  className="ml-3 shrink-0 text-xs px-2 py-1 rounded"
                  style={{ background: "none", border: "none", color: "hsl(215 14% 40%)", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}