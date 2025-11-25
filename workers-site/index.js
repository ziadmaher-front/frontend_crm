// Cloudflare Workers script for static site with SPA routing
// For [site] configuration, use the default asset handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const pathname = url.pathname
    
    // Try to fetch the requested asset
    // For [site] configuration, assets are available through the default handler
    let response
    
    try {
      // First, try to get the actual file
      response = await env.ASSETS.fetch(request)
      
      // If 404 and not already requesting index.html, serve index.html for SPA routing
      if (response.status === 404 && pathname !== '/' && pathname !== '/index.html') {
        // Create request for index.html
        const indexUrl = new URL('/', url.origin)
        const indexRequest = new Request(indexUrl.toString(), {
          method: request.method,
          headers: request.headers
        })
        response = await env.ASSETS.fetch(indexRequest)
      }
    } catch (e) {
      // If error, try to serve index.html
      try {
        const indexUrl = new URL('/', url.origin)
        const indexRequest = new Request(indexUrl.toString(), {
          method: request.method,
          headers: request.headers
        })
        response = await env.ASSETS.fetch(indexRequest)
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
    
    return response
  }
}
