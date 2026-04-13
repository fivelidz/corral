import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Event, Rsvp } from "@/types";

// ── Events ──────────────────────────────────────────────────────────────────

export function useEvents() {
  return useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useEvent(id: string) {
  return useQuery<Event>({
    queryKey: ["events", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (event: Omit<Event, "id" | "created_at">) => {
      const { data, error } = await supabase.from("events").insert(event).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

// ── RSVPs ────────────────────────────────────────────────────────────────────

export function useRsvps() {
  return useQuery<Rsvp[]>({
    queryKey: ["rsvps"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rsvps").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useEventRsvps(eventId: string) {
  return useQuery<Rsvp[]>({
    queryKey: ["rsvps", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rsvps")
        .select("*")
        .eq("event_id", eventId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!eventId,
  });
}

export function useUpsertRsvp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, userId, status }: { eventId: string; userId: string; status: Rsvp["status"] }) => {
      const { data, error } = await supabase
        .from("rsvps")
        .upsert({ event_id: eventId, user_id: userId, status }, { onConflict: "event_id,user_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rsvps"] });
    },
  });
}
