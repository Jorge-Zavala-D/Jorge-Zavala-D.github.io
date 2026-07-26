const canonicalOrigin = "https://jorge-zavala-d.github.io";
const canonicalBasePath = "/Jorge-Zavala-Academic-Site";

function upstreamUrl(requestUrl) {
  const incoming = new URL(requestUrl);
  const pathname = incoming.pathname.startsWith(canonicalBasePath)
    ? incoming.pathname
    : `${canonicalBasePath}${incoming.pathname === "/" ? "/" : incoming.pathname}`;

  return new URL(`${pathname}${incoming.search}`, canonicalOrigin);
}

export default {
  async fetch(request) {
    const headers = new Headers();
    for (const name of ["accept", "accept-encoding", "accept-language", "if-modified-since", "if-none-match"]) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }

    const response = await fetch(upstreamUrl(request.url), {
      headers,
      method: request.method === "HEAD" ? "HEAD" : "GET",
      redirect: "follow",
    });

    const outgoingHeaders = new Headers(response.headers);
    outgoingHeaders.set("x-content-source", "jorge-zavala-academic-github-pages");

    return new Response(response.body, {
      headers: outgoingHeaders,
      status: response.status,
      statusText: response.statusText,
    });
  },
};
