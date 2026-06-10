/**
 * Amis API fetcher — wraps fetch for Amis requests.
 * Handles GET query string encoding and POST JSON body serialization.
 */

export interface AmisApiRequest {
  url: string;
  method?: string;
  data?: unknown;
  config?: RequestInit;
}

export interface AmisApiResponse {
  status: number;
  data: unknown;
  msg?: string;
}

export function defaultFetcher(
  api: AmisApiRequest,
  _props?: unknown,
): Promise<AmisApiResponse> {
  const { url, method = 'get', data, config } = api;
  let fetchUrl = url;
  const fetchConfig: RequestInit = {
    method: method.toUpperCase(),
    headers: { 'Content-Type': 'application/json' },
    ...config,
  };

  if (method === 'get' && data) {
    const params = new URLSearchParams(data as Record<string, string>);
    fetchUrl += (fetchUrl.includes('?') ? '&' : '?') + params.toString();
  } else if (data) {
    fetchConfig.body = JSON.stringify(data);
  }

  return fetch(fetchUrl, fetchConfig).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json();
  });
}
