import { toast } from "sonner"
// import LoadingBar from "react-top-loading-bar"

// let loadingRef: any = null
// export const bindLoadingBar = (ref: any) => {
//   loadingRef = ref
// }

export const BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:8000/api" : "/api"
// export const BASE_URL = "http://10.5.146.66:8000/api"
// export const BASE_URL = "/api"

export async function api<T>(
  endpoint: string,
  {
    method = "GET",
    body,
    token,
    getToken,
    isMultipart = false,
  }: ApiOptions = {}
): Promise<T> {
  try {
    // loadingRef?.continuousStart()

    const resolvedToken = token ?? (getToken ? await getToken() : null)

    const headers: HeadersInit = {
      ...(resolvedToken && { Authorization: `Bearer ${resolvedToken}` }),
    }

    // Only set JSON header if NOT multipart
    if (!isMultipart) {
      headers["Content-Type"] = "application/json"
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body
        ? isMultipart
          ? body // FormData goes RAW
          : JSON.stringify(body)
        : undefined,
    })

    const data = await res.json()

    if (!res.ok) {
      // toast("Request failed", data?.message || "Something went wrong")
      console.log(res, data)
      throw new Error(data?.message)
    }

    return data
  } catch (err: any) {
    console.log(err.message)
    toast(err.message ?? "Network error", err.message ?? "Server unreachable")
    throw err
  }
}
