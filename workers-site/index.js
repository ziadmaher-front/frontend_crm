// Cloudflare Workers script to serve static files
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Get the pathname, default to index.html
  let pathname = url.pathname === '/' ? '/index.html' : url.pathname
  
  // Try to get the file from the site bucket
  try {
    return await env.ASSETS.fetch(new Request(url.toString(), request))
  } catch (e) {
    // If file not found, serve index.html for SPA routing
    return await env.ASSETS.fetch(new Request(new URL('/index.html', url.origin).toString(), request))
  }
}

