import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter } from "react-router";
import { PassThrough } from "stream";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: any,
  loadContext: any
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          
          responseHeaders.set("Content-Type", "text/html");
          
          resolve(
            new Response(body as any, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );
          
          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          console.error(error);
          responseStatusCode = 500;
        },
      }
    );

    setTimeout(abort, 5000);
  });
}