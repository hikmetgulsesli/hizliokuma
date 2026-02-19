import '@testing-library/jest-dom'

// Mock Next.js server modules
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => {
      const response = new Response(JSON.stringify(body), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers || {}),
        },
      });
      return Object.assign(response, { json: () => Promise.resolve(body) });
    }),
  },
}));

// Add Request/Response globals if not available
if (typeof Request === 'undefined') {
  global.Request = class Request {
    url: string;
    method: string;
    headers: Headers;
    body: string | null;

    constructor(input: string | Request, init?: RequestInit) {
      if (typeof input === 'string') {
        this.url = input;
      } else {
        this.url = input.url;
      }
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
      this.body = init?.body as string || null;
    }

    json() {
      return Promise.resolve(JSON.parse(this.body || '{}'));
    }
  } as unknown as typeof Request;
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    body: unknown;
    status: number;
    headers: Headers;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Headers(init?.headers);
    }

    json() {
      return Promise.resolve(JSON.parse(this.body as string || '{}'));
    }
  } as unknown as typeof Response;
}

if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    private headers: Map<string, string> = new Map();

    constructor(init?: Record<string, string> | Headers | string[][]) {
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.headers.set(key, value));
        } else if (init instanceof Headers) {
          // Handle Headers instance
          (init as unknown as { headers: Map<string, string> }).headers?.forEach((value, key) => {
            this.headers.set(key, value);
          });
        } else {
          Object.entries(init).forEach(([key, value]) => this.headers.set(key, value));
        }
      }
    }

    get(name: string): string | null {
      return this.headers.get(name) || null;
    }

    set(name: string, value: string): void {
      this.headers.set(name, value);
    }

    forEach(callback: (value: string, key: string) => void): void {
      this.headers.forEach((value, key) => callback(value, key));
    }
  } as unknown as typeof Headers;
}
