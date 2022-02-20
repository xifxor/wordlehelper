import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = false;

// const customKeyModifier = request => {
//   let url = request.url
//   console.log (url)
//   //custom key mapping optional
//   url = url.replace('/wh', '').replace(/^\/+/, '')
//   return mapRequestToAsset(new Request(url, request))
// }
// console.log ('customKeyModifier', customKeyModifier)

addEventListener('fetch', (event) => {
  try {
    event.respondWith(handleEvent(event));
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        })
      );
    }
    event.respondWith(new Response('Internal Error', { status: 500 }));
  }
});

async function handleEvent(event) {
  let options = { mapRequestToAsset };


  try {
    if (DEBUG) {
      // customize caching
      // options.cacheControl = {
        // bypassCache: true,
      // };
    }
    console.log ('event', event.toString)
    console.log ('options', options.toString)
    return await getAssetFromKV(event, options)
  } catch (e) {
    // if an error is thrown try to serve the asset at 404.html
    if (!DEBUG) {
      try {
        let notFoundResponse = await getAssetFromKV(event, {
          mapRequestToAsset: (req) =>
            new Request(`${new URL(req.url).origin}/404.html`, req),
        });
        console.log ('notFoundResponse:', notFoundResponse.toString)
        return new Response(notFoundResponse.body, {
          ...notFoundResponse,
          status: 404,
        });
      } catch (e) {}
    }

    return new Response(e.message || e.toString(), { status: 500 });
  }
}