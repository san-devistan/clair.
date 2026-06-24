import { createServerFn } from "@tanstack/react-start"

export const getAuthToken = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getToken } = await import("./server")

    return (await getToken()) ?? null
  }
)
