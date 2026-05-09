// Supabase Edge Function para buscar GIFs do ExerciseDB
// Uso: POST /functions/v1/get-exercise-gif
// Body: { exerciseId: string, searchTerm: string }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
const RAPIDAPI_HOST = 'exercisedb.p.rapidapi.com';
const CACHE_TTL = 604800; // 7 dias em segundos

// Cache simples em memória (Edge Functions reiniciam periodicamente)
const gifCache = new Map<string, { url: string; timestamp: number }>();

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { exerciseId, searchTerm } = await req.json();

    if (!searchTerm) {
      return new Response(
        JSON.stringify({ error: 'searchTerm is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar cache
    const cached = gifCache.get(exerciseId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL * 1000) {
      return new Response(
        JSON.stringify({ gifUrl: cached.url, cached: true }),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      );
    }

    // Verificar se temos RAPIDAPI_KEY
    if (!RAPIDAPI_KEY) {
      console.error('RAPIDAPI_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'API key not configured', gifUrl: null }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Chamar ExerciseDB API
    const url = `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(searchTerm)}?limit=1&offset=0`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      console.warn(`ExerciseDB API returned ${response.status} for ${searchTerm}`);
      return new Response(
        JSON.stringify({ error: 'Exercise not found', gifUrl: null }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0 && data[0].gifUrl) {
      const gifUrl = data[0].gifUrl;
      
      // Cachear resultado
      gifCache.set(exerciseId, { url: gifUrl, timestamp: Date.now() });
      
      return new Response(
        JSON.stringify({ gifUrl, cached: false }),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'No GIF found', gifUrl: null }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-exercise-gif:', error);
    return new Response(
      JSON.stringify({ error: error.message, gifUrl: null }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
