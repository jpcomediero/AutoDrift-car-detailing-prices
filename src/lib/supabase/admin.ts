export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

  return {
    storage: {
      from(bucket: string) {
        return {
          async upload(
            filePath: string,
            fileBody: Buffer | Blob | Uint8Array,
            options?: { contentType?: string; upsert?: boolean }
          ) {
            try {
              const body = (fileBody instanceof Buffer ? new Uint8Array(fileBody) : fileBody) as unknown as BodyInit;
              const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`, {
                method: "POST",
                headers: {
                  apikey: serviceRoleKey,
                  Authorization: `Bearer ${serviceRoleKey}`,
                  "Content-Type": options?.contentType || "application/octet-stream",
                  "x-upsert": options?.upsert ? "true" : "false",
                },
                body,
              });

              const data = await res.json().catch(() => ({}));
              if (!res.ok) {
                return { data: null, error: { message: data.message || data.error || "Storage upload failed" } };
              }

              return { data: { path: filePath }, error: null };
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : "Storage error";
              return { data: null, error: { message: msg } };
            }
          },

          async remove(paths: string[]) {
            try {
              const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}`, {
                method: "DELETE",
                headers: {
                  apikey: serviceRoleKey,
                  Authorization: `Bearer ${serviceRoleKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ prefixes: paths }),
              });

              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                return { data: null, error: { message: data.message || "Failed to delete files" } };
              }

              return { data: { deleted: true }, error: null };
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : "Delete error";
              return { data: null, error: { message: msg } };
            }
          },

          getPublicUrl(filePath: string) {
            return {
              data: {
                publicUrl: `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`,
              },
            };
          },
        };
      },
    },
  };
}
