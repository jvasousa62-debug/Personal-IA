import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {

  const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");

  const response = await fetch("https://exercisedb.p.rapidapi.com/exercises?limit=10", {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": RAPIDAPI_KEY!,
      "X-RapidAPI-Host": "exercisedb.p.rapidapi.com"
    }
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
});
