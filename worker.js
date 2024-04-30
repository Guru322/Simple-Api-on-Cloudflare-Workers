addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const API_TOKEN = 'Your Cloudflare Api Token'
const ACCOUNT_ID = 'Your Cloudflare Account Id'



async function handleRequest(request) {
  const url = new URL(request.url)
 

  // Endpoint routing
  if (url.pathname === '/mistral') {
    return handlemistralRequest(request, url);
  } else if (url.pathname === '/llama'){
    return handlellamaRequest(request, url)
  } else if (url.pathname === '/dream'){
    return handletxtimgRequest(request, url)
  } else if (url.pathname === '/') { 
    return new Response(JSON.stringify({ 
      text: "Hello Mom!",
      endpoints: {
        "/mistral": "Need text parameter, Returns a json output",
        "/llama": "Need prompt parameter, Returns a json output.",
        "/dream": "Need prompt parameter, Returns a PNG output."
      }, 
      creator: "Guru", 
      follow: "https://github.com/Guru322" 
    }, null, 2), {
      headers: { 'content-type': 'application/json' } 
    }); 
  } else {
    return new Response('Not found', { status: 404 }); 
  }
}

/**
 * @param {{url: {searchParams: {get: (arg0: string) => any;};};}} request
 * @param {URL} url
 */
async function handlemistralRequest(request, url) {

  const text = url.searchParams.get('text')

  if (!text) {
    return new Response('Missing "text" parameter', { status: 400 })
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/mistral/mistral-7b-instruct-v0.1`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: text }]
      })
    }
  )

  const data = await response.json();
  console.log(data)

  if (!response.ok || !data.result) {
    return new Response('Error interacting with Workers', { status: 500 })
  }

  const aiResponse = data.result;
  return new Response(JSON.stringify({ text: text, response: aiResponse, creator: "Guru" }, null, 2), {
    headers: { 'content-type': 'application/json' }
  })
}

/**
 * @param {any} request
 * @param {{ searchParams: { get: (arg0: string) => any; }; }} url
 */
async function handlellamaRequest(request, url) {

  const text = url.searchParams.get('prompt')

  if (!text) {
    return new Response('Missing "prompt" parameter', { status: 400 })
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/meta/llama-3-8b-instruct`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: text }]
      })
    }
  )

  const data = await response.json();

  if (!response.ok || !data.result) {
    return new Response('Error interacting with Workers', { status: 500 })
  }

  const aiResponse = data.result;
  return new Response(JSON.stringify({ text: text, response: aiResponse, creator: "Guru" }, null, 2), {
    headers: { 'content-type': 'application/json' }
  })
}

/**
 * @param {any} _request
 * @param {URL} url
 */
async function handletxtimgRequest(_request, url) {
  const prompt = url.searchParams.get('prompt')

  if (!prompt) {
    return new Response('Missing "prompt" parameter', { status: 400 })
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/lykon/dreamshaper-8-lcm`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: prompt }) 
    }
  )

  if (!response.ok) { 
    return new Response('Error interacting with Dreamshaper model', { status: 500 })
  }

  // Important: image data as ArrayBuffer
  const imageData = await response.arrayBuffer(); 

  return new Response(imageData, {
    headers: { 'content-type': 'image/png' } 
  })
}
