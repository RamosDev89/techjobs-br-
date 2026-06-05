import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Client para uso em Client Components.
 * createBrowserClient (de @supabase/ssr) armazena o PKCE code_verifier
 * em cookies — acessível no server para o exchangeCodeForSession.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * Service client para uso exclusivo em Server Actions / API Routes
 * com permissões elevadas (service_role).
 */
export function createServiceClient() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
