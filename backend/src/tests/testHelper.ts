import http from 'http';
import { app } from '../app.js';
import { initializeSchema } from '../db/initSchema.js';

export const TEST_PORT = 5999;
export const BASE_URL = `http://localhost:${TEST_PORT}/api/v1`;

export interface TestResult {
  category: string;
  method: string;
  endpoint: string;
  expectedStatus: number | number[];
  actualStatus: number;
  passed: boolean;
  notes?: string;
}

export const results: TestResult[] = [];

export async function httpRequest(
  method: string,
  path: string,
  headers: Record<string, string> = {},
  body?: any
): Promise<{ status: number; body: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const postData = body ? JSON.stringify(body) : undefined;

    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-dev-user-id': '1',
      'x-dev-username': 'miguel',
      'x-dev-role': 'ADMIN',
      'X-Store-Context': '1',
      ...headers
    };

    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders
      },
      res => {
        let rawData = '';
        res.on('data', chunk => {
          rawData += chunk;
        });
        res.on('end', () => {
          let parsed: any;
          try {
            parsed = JSON.parse(rawData);
          } catch {
            parsed = rawData;
          }
          resolve({
            status: res.statusCode || 500,
            body: parsed,
            headers: res.headers
          });
        });
      }
    );

    req.on('error', err => reject(err));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

export function record(
  category: string,
  method: string,
  endpoint: string,
  expectedStatus: number | number[],
  actualStatus: number,
  notes?: string
) {
  const isExpected = Array.isArray(expectedStatus)
    ? expectedStatus.includes(actualStatus)
    : expectedStatus === actualStatus;
  results.push({
    category,
    method,
    endpoint,
    expectedStatus,
    actualStatus,
    passed: isExpected,
    notes
  });
}

let testServer: http.Server | null = null;

export async function startTestServer(): Promise<http.Server> {
  await initializeSchema();
  return new Promise(resolve => {
    testServer = app.listen(TEST_PORT, () => {
      resolve(testServer!);
    });
  });
}

export async function stopTestServer(): Promise<void> {
  return new Promise(resolve => {
    if (testServer) {
      testServer.close(() => resolve());
    } else {
      resolve();
    }
  });
}
