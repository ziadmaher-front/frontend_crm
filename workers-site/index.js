// Minimal Cloudflare Workers script for static site with SPA routing
// For [site] configuration, ASSETS is available as a global
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
  const url = new URL(event.request.url)
  const pathname = url.pathname
  
  // Try to fetch the requested asset
  let response = await ASSETS.fetch(event.request)
  
  // If 404 and not already requesting index.html, serve index.html for SPA routing
  if (response.status === 404 && pathname !== '/' && pathname !== '/index.html') {
    // Create request for index.html
    const indexUrl = new URL('/', url.origin)
    const indexRequest = new Request(indexUrl.toString(), {
      method: event.request.method,
      headers: event.request.headers
    })
    response = await ASSETS.fetch(indexRequest)
  }
  
  return response
}
