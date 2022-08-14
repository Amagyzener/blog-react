// [ REQUEST SENDER ] –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
/* RequestInit
 method?: 'GET' | 'PUT' | 'POST' | 'DELETE' | 'HEAD' | 'OPTIONS'
 headers?: Headers | <Record<string, unknown>>
 body?: any
 mode?: 'cors' | 'no-cors' | 'same-origin'
 credentials?: 'omit' | 'same-origin' | 'include'
 cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached'
 redirect?: 'follow' | 'error' | 'manual'
 referrer?: string
 referrerPolicy?:
	'no-referrer' | 'no-referrer-when-downgrade' |
	'same-origin' | 'origin' | 'strict-origin' |
	'origin-when-cross-origin' | 'strict-origin-when-cross-origin' |
	'unsafe-url'
 integrity?: string
 keepalive?: boolean
 signal?: AbortSignal
*/

export interface RequestParamsRaw {
	params?: RequestInit;
	attempts?: number;
	debug?: boolean;
}

export interface RequestParams extends RequestParamsRaw {
	as?: 'json' | 'text' | 'arrayBuffer' | 'blob' | 'formData';
}

class RequestError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'RequestError';
	}
}
class AttemptsExceededError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'AttemptsExceededError';
	}
}

const URI_MAX_LENGTH = 2000; // in bytes
//export async function sendRequest(request: string, { params, attempts, debug }: RequestParamsRaw): Promise<Response>;
//export async function sendRequest<T>(request: string, { params, attempts, debug, as }: RequestParams): Promise<T>;

// функция предварительной проверки запроса
function requestPreCheck(request: string, params: RequestInit, attempts: number, debug: boolean): void {
	if (attempts == 0)
		throw new AttemptsExceededError('Attempts limit exceeded');

	debug && console.info('[%s] Request length: %i bytes | Attempting to send request', params.method ?? 'GET', request.length);
	/* RFC 7230 [3.1.1]: Various ad-hoc limitations on request-line length are found in practice.
		It is RECOMMENDED that all HTTP senders and recipients support, at a minimum, request-line lengths of 8000 octets. */
	if (request.length > URI_MAX_LENGTH) throw new URIError(`URI is too long (maximum length: ${URI_MAX_LENGTH} bytes)`);
}

// функция проверки результата запроса
function requestPostCheck(request: string, response: Response, attempts: number, debug: boolean): void {
	debug && console.warn(
		`Requesting %s\nAttempts left: %i | ${response.ok && 'Content length: %s bytes' || 'FAILED'}`,
		request, attempts, response.ok && response.headers.get('Content-Length') || ''
	);

	//if (attempts >= 0) throw new RequestError('DUMMY');
	if (!response.ok)
		throw new RequestError(`Couldn’t fetch ${response.url} (status ${response.status})`);
}

// собственно, сам запрос
async function requestProcess(request: string, params: RequestInit, attempts: number, debug: boolean): Promise<Response> {
	requestPreCheck(request, params, attempts, debug);
	const response = await fetch(request, params);
	requestPostCheck(request, response, --attempts, debug);
	return response;
}


export async function sendRequestRaw(
	request: string,
	{ params = {}, attempts = 1, debug = false }: RequestParamsRaw = {}
): Promise<Response> {
	console.log(params);
	try {
		return await requestProcess(request, params, attempts--, debug);
	} catch (e) {
		debug && console.dir(e);
		if (e instanceof RequestError)
			return sendRequestRaw(request, { params, attempts, debug }); // let’s try again
		else
			throw e;
	}
}

export async function sendRequest<T>(
	request: string,
	{ params = {}, attempts = 1, debug = false, as = 'json' }: RequestParams = {}
): Promise<T> {
	try {
		const response: Response = await requestProcess(request, params, attempts--, debug);
		return response[as]();
	} catch (e) {
		debug && console.dir(e);
		if (e instanceof RequestError)
			return sendRequest<T>(request, { params, attempts, debug, as }); // let’s try again
		else
			throw e;
	}
}


// [ STRING LIMITER ] –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
interface LimitStringParams {
	tail?: string;
	trim?: boolean;
	strict?: boolean;
}

export function limitString(text: string, limit: number, params?: LimitStringParams): string {
	limit % 1 != 0 && (limit = limit | 0);
	if (limit <= 0) limit = text.length + limit;

	const options: LimitStringParams = {
		tail: '\u2026',	// что дописать после обрыва (default: ellipsis)
		trim: true,			// обрезать пробелы в начале/конце?
		strict: false		// обрезать слова?
	};

	// apply user params
	Object.assign(options, params);

	if (options.trim) text = text.trim(); // удаление пробелов в начале/конце
	if (text.length <= limit) return text; // если строка уже вписывается в ограничение по длине

	text = text.slice(0, limit); // обрезка по ограничению длины строки

	let lastSpace = text.lastIndexOf('\u0020');
	for (let char = lastSpace; char >= 0; lastSpace--)
		if (!/\p{Sentence_Terminal}|\p{Pattern_Syntax}|\u0020/gu.test(text[--char])) break;
	// дополнительная обрезка до границы целого слова
	if (!options.strict && lastSpace > 0) text = text.slice(0, lastSpace);
	return text + options.tail;
}


// [ FORMATS ] ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
export const dateFormat = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
// ignore empty & too long tags (up to 32)
export const tagListFormat = (tag: string | null): string => {
	if (tag == null) return '';
	const nsTag = tag.trim();
	return nsTag.length && nsTag.length <= 32 && `#${nsTag.replace(/\s/g, '_')}` || '';
};


// [ MISC ] –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
export const imgFallback = (event: React.InvalidEvent<HTMLImageElement>) => event.target.src = '../favicon.ico';

export function isValidHttpURL(input: string): boolean {
	try {
		const url = new URL(input);
		return url.protocol == 'http:' || url.protocol == 'https:';
	} catch {
		return false;  
	}
}