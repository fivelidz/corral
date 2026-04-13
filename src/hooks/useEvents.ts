import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { IS_DEMO, DEMO_EVENTS, DEMO_RSVPS } from "@/lib/demo-data";
import type { Event, Rsvp } from "@/types";

// ── Events ────────────────────────────────────────────────────────────────────

export function useEvents() {
  return useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: async () => {
      if (IS_DEMO) return DEMO_EVENTS;
      const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true });
      if (error) throw error;
      return (data as Event[]) ?? [];
    },
  });
}

export function useEvent(id: string) {
  return useQuery<Event>({
    queryKey: ["events", id],
    queryFn: async () => {
      if (IS_DEMO) {
        const e = DEMO_EVENTS.find(e => e.id === id);
        if (!e) throw new Error("Event not found");
        return e;
      }
      const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Event;
    },
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (event: Omit<Event, "id" | "created_at">) => {
      if (IS_DEMO) {
        return { ...event, id: `demo-${Date.now()}`, created_at: new Date().toISOString() } as Event;
      }
      const { data, error } = await supabase.from("events").insert(event).select().single();
      if (error) throw error;
      return data as Event;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

// ── RSVPs ─────────────────────────────────────────────────────────────────────

export function useRsvps() {
  return useQuery<Rsvp[]>({
    queryKey: ["rsvps"],
    queryFn: async () => {
      if (IS_DEMO) return DEMO_RSVPS;
      const { data, error } = await supabase.from("rsvps").select("*");
      if (error) throw error;
      return (data as Rsvp[]) ?? [];
    },
  });
}

export function useEventRsvps(eventId: string) {
  return useQuery<Rsvp[]>({
    queryKey: ["rsvps", eventId],
    queryFn: async () => {
      if (IS_DEMO) return DEMO_RSVPS.filter(r => r.event_id === eventId);
      const { data, error } = await supabase.from("rsvps").select("*").eq("event_id", eventId);
      if (error) throw error;
      return (data as Rsvp[]) ?? [];
    },
    enabled: !!eventId,
  });
}

export function useUpsertRsvp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, userId, status }: { eventId: string; userId: string; status: Rsvp["status"] }) => {
      if (IS_DEMO) {
        return { id: `rsvp-${Date.now()}`, event_id: eventId, user_id: userId, status } as Rsvp;
      }
      const { data, error } = await supabase
        .from("rsvps")
        .upsert({ event_id: eventId, user_id: userId, status }, { onConflict: "event_id,user_id" })
        .select()
        .single();
      if (error) throw error;
      return data as Rsvp;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rsvps"] }),
  });
}
