// Cloudflare Workers script to serve static files for React SPA
// For Cloudflare Workers with [site] configuration, assets are automatically bound
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    let pathname = url.pathname
    
    // Default to index.html for root
    if (pathname === '/') {
      pathname = '/index.html'
    }
    
    // For [site] configuration, use the default asset handler
    // The assets are automatically available through the site binding
    try {
      // Try to fetch the requested file
      const assetRequest = new Request(new URL(pathname, url.origin).toString(), request)
      const response = await env.ASSETS.fetch(assetRequest)
      
      // If file not found (404), serve index.html for SPA routing
      if (response.status === 404 && pathname !== '/index.html') {
        const indexRequest = new Request(new URL('/index.html', url.origin).toString(), request)
        return await env.ASSETS.fetch(indexRequest)
      }
      
      return response
    } catch (e) {
      // If error accessing assets, try to serve index.html
      try {
        const indexRequest = new Request(new URL('/index.html', url.origin).toString(), request)
        return await env.ASSETS.fetch(indexRequest)
      } catch (e2) {
        // If index.html also fails, return error
        return new Response('Not Found', { status: 404, statusText: 'File not found' })
      }
    }
  }
}

