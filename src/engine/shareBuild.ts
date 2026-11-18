import type { Inputs } from "./types"
import { withoutDerivedStats } from "./derivedInputs"
import { hydrateInputs } from "../storage"

export interface SharedBuildPayload {
  v: number
  author: string
  title: string
  inputs: Inputs
}

export function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = ""
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export function base64UrlToUint8Array(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/")
  while (base64.length % 4) base64 += "="
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function compressBytes(bytes: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream("deflate-raw")
  const writer = cs.writable.getWriter()
  await writer.write(bytes as unknown as BufferSource)
  await writer.close()
  const chunks: Uint8Array[] = []
  const reader = cs.readable.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }
  const totalLength = chunks.reduce((acc, c) => acc + c.byteLength, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.byteLength
  }
  return result
}

export async function decompressBytes(bytes: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream("deflate-raw")
  const writer = ds.writable.getWriter()
  await writer.write(bytes as unknown as BufferSource)
  await writer.close()
  const chunks: Uint8Array[] = []
  const reader = ds.readable.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }
  const totalLength = chunks.reduce((acc, c) => acc + c.byteLength, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.byteLength
  }
  return result
}

export async function encodeSharedBuild(payload: SharedBuildPayload): Promise<string> {
  const compactPayload = {
    v: payload.v,
    author: payload.author || "",
    title: payload.title || "",
    inputs: withoutDerivedStats(payload.inputs),
  }
  const json = JSON.stringify(compactPayload)
  const rawBytes = new TextEncoder().encode(json)
  const compressed = await compressBytes(rawBytes)
  return uint8ArrayToBase64Url(compressed)
}

export async function decodeSharedBuild(encoded: string): Promise<SharedBuildPayload> {
  const bytes = base64UrlToUint8Array(encoded.trim())
  const decompressed = await decompressBytes(bytes)
  const json = new TextDecoder().decode(decompressed)
  const parsed = JSON.parse(json) as {
    v?: number
    author?: string
    title?: string
    inputs?: unknown
  }
  if (!parsed || typeof parsed !== "object" || !parsed.inputs) {
    throw new Error("Invalid shared build payload")
  }
  const inputs = hydrateInputs(parsed.inputs as unknown as Inputs)
  return {
    v: typeof parsed.v === "number" ? parsed.v : 1,
    author: typeof parsed.author === "string" ? parsed.author : "",
    title: typeof parsed.title === "string" ? parsed.title : "",
    inputs,
  }
}
