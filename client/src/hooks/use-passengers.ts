import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

// GET /api/analysis/eda
export function useEdaStats() {
  return useQuery({
    queryKey: [api.passengers.eda.path],
    queryFn: async () => {
      const res = await fetch(api.passengers.eda.path);
      if (!res.ok) throw new Error("Failed to fetch EDA stats");
      // Use Zod schema from routes to validate response
      return api.passengers.eda.responses[200].parse(await res.json());
    },
  });
}

// GET /api/passengers (List view if needed later)
export function usePassengers() {
  return useQuery({
    queryKey: [api.passengers.list.path],
    queryFn: async () => {
      const res = await fetch(api.passengers.list.path);
      if (!res.ok) throw new Error("Failed to fetch passengers");
      return api.passengers.list.responses[200].parse(await res.json());
    },
  });
}
