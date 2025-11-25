// Cloudflare Workers script to serve static files for React SPA
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    // Get the pathname
    let pathname = url.pathname
    
    // Default to index.html for root
    if (pathname === '/') {
      pathname = '/index.html'
    }
    
    // Try to get the file from assets
    try {
      // Use the default asset handler
      const response = await env.ASSETS.fetch(new Request(new URL(pathname, url.origin).toString(), request))
      
      // If file not found (404), serve index.html for SPA routing
      if (response.status === 404 && pathname !== '/index.html') {
        return await env.ASSETS.fetch(new Request(new URL('/index.html', url.origin).toString(), request))
      }
      
      return response
    } catch (e) {
      // If error, try to serve index.html
      try {
        return await env.ASSETS.fetch(new Request(new URL('/index.html', url.origin).toString(), request))
      } catch (e2) {
        // If index.html also fails, return error
        return new Response('Not Found', { status: 404 })
      }
    }
  }
}

