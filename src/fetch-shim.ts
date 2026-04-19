// This shim prevents legacy libraries from crashing when they try to overwrite global fetch
const _fetch = typeof window !== 'undefined' ? window.fetch.bind(window) : globalThis.fetch;
const _Request = typeof window !== 'undefined' ? window.Request : globalThis.Request;
const _Response = typeof window !== 'undefined' ? window.Response : globalThis.Response;
const _Headers = typeof window !== 'undefined' ? window.Headers : globalThis.Headers;

export { _fetch as fetch, _Request as Request, _Response as Response, _Headers as Headers };
export default _fetch;
