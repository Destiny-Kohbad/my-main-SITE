const _fetch = globalThis.fetch;
const _Request = globalThis.Request;
const _Response = globalThis.Response;
const _Headers = globalThis.Headers;

export { _fetch as fetch, _Request as Request, _Response as Response, _Headers as Headers };
export default _fetch;
