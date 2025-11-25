// Cloudflare Workers script to serve static files for React SPA
// Using the service worker format for [site] configuration
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
  const url = new URL(event.request.url)
  let pathname = url.pathname
  
  // Remove leading slash for asset lookup
  let assetPath = pathname === '/' ? 'index.html' : pathname.slice(1)
  
  // Try to get the file from the site bucket
  try {
    // Use the default asset handler from the site bucket
    const response = await ASSETS.fetch(event.request)
    
    // If file not found (404) and it's not already index.html, serve index.html for SPA routing
    if (response.status === 404 && pathname !== '/' && pathname !== '/index.html') {
      // Create a new request for index.html
      const indexUrl = new URL('/', url.origin)
      const indexRequest = new Request(indexUrl.toString(), event.request)
      return await ASSETS.fetch(indexRequest)
    }
    
    return response
  } catch (e) {
    // If error, try to serve index.html
    try {
      const indexUrl = new URL('/', url.origin)
      const indexRequest = new Request(indexUrl.toString(), event.request)
      return await ASSETS.fetch(indexRequest)
    } catch (e2) {
      // Return a proper 404 response
      return new Response('Not Found', { 
        status: 404,
        headers: {
          'Content-Type': 'text/plain'
        }
      })
    }
  }
}
