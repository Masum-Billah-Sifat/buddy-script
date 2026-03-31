import { NextResponse } from "next/server";

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function badRequest(message = "Bad request", errors?: unknown) {
  return NextResponse.json(
    { ok: false, message, ...(errors ? { errors } : {}) },
    { status: 400 }
  );
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ ok: false, message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ ok: false, message }, { status: 403 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ ok: false, message }, { status: 404 });
}

export function conflict(message = "Conflict") {
  return NextResponse.json({ ok: false, message }, { status: 409 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ ok: false, message }, { status: 500 });
}