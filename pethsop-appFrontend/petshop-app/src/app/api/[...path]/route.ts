import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

async function handler(req: NextRequest) {
  const { pathname, search } = req.nextUrl;


  const targetUrl = `${BACKEND_URL}${pathname}${search}`;

  const headers = new Headers(req.headers);

 
  headers.delete("host");
  headers.delete("content-length");

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
    credentials: "include",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    fetchOptions.body = await req.text();
  }

  const backendResponse = await fetch(targetUrl, fetchOptions);

  const response = new NextResponse(backendResponse.body, {
    status: backendResponse.status,
  });

  backendResponse.headers.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}

export async function PUT(req: NextRequest) {
  return handler(req);
}

export async function DELETE(req: NextRequest) {
  return handler(req);
}
