import { createBrowserClient } from "@supabase/ssr";

export function createClient(): any {
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: "folio_app" },
    } as any
  ) as any;
}
