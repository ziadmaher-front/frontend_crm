// Cloudflare Workers script to serve static files for React SPA
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    
    // Get the pathname, default to index.html
    let pathname = url.pathname === '/' ? '/index.html' : url.pathname
    
    // Try to get the file from the site bucket
    try {
      return await env.ASSETS.fetch(new Request(url.toString(), request))
    } catch (e) {
      // If file not found, serve index.html for SPA routing
      const indexUrl = new URL('/index.html', url.origin)
      return await env.ASSETS.fetch(new Request(indexUrl.toString(), request))
    }
  }
}

