import '@testing-library/jest-dom'

// Polyfill for Request in Node.js test environment
class MockRequest {
  url: string;
  method: string;
  headers: Headers;
  body: string | null;

  constructor(url: string, init?: RequestInit) {
    this.url = url;
    this.method = init?.method || 'GET';
    this.headers = new Headers(init?.headers);
    this.body = init?.body as string || null;
  }

  async json() {
    return this.body ? JSON.parse(this.body) : {};
  }

  async text() {
    return this.body || '';
  }
}

// @ts-ignore
global.Request = MockRequest;

// Mock next/server before any imports use it
jest.mock('next/server', () => ({
  NextRequest: class extends MockRequest {
    nextUrl: { searchParams: URLSearchParams };

    constructor(url: string, init?: RequestInit) {
      super(url, init);
      const parsedUrl = new URL(url, 'http://localhost:3000');
      this.nextUrl = {
        searchParams: parsedUrl.searchParams,
      };
    }
  },
  NextResponse: {
    json: (data: any, init?: ResponseInit) => {
      return {
        json: async () => data,
        status: init?.status || 200,
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };
    },
  },
}));
