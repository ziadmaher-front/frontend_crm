// Cloudflare Workers script to serve static files for React SPA
// This handles SPA routing by serving index.html for all routes
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  let pathname = url.pathname
  
  // Default to index.html for root
  if (pathname === '/') {
    pathname = '/index.html'
  }
  
  // Try to get the file from the site bucket
  // For [site] configuration, files are served automatically
  // We just need to handle SPA routing
  try {
    // First, try to get the actual file
    const fileRequest = new Request(new URL(pathname, url.origin).toString(), request)
    const response = await ASSETS.fetch(fileRequest)
    
    // If file not found and it's not index.html, serve index.html for SPA routing
    if (response.status === 404 && pathname !== '/index.html') {
      const indexRequest = new Request(new URL('/index.html', url.origin).toString(), request)
      return await ASSETS.fetch(indexRequest)
    }
    
    return response
  } catch (e) {
    // If error, try to serve index.html
    try {
      const indexRequest = new Request(new URL('/index.html', url.origin).toString(), request)
      return await ASSETS.fetch(indexRequest)
    } catch (e2) {
      return new Response('Not Found', { status: 404 })
    }
  }
}
