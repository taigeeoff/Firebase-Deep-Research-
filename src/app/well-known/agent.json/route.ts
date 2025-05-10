// src/app/.well-known/agent.json/route.ts
import { NextResponse } from 'next/server';
import { virtualCustomerEngineerCard } from '@/lib/a2a/a2aInterface';

export async function GET() {
  // Add CORS headers if needed, similar to the POST endpoint,
  // though often less strict for GET requests on this specific path.
  const headers = {
    'Access-Control-Allow-Origin': '*', // Adjust as needed
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  return NextResponse.json(virtualCustomerEngineerCard, { headers });
}

// Optional: Add OPTIONS handler if CORS needs preflight
export async function OPTIONS() {
   const headers = {
    'Access-Control-Allow-Origin': '*', // Adjust as needed
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  return new NextResponse(null, { status: 204, headers });
}