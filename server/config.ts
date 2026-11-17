import path from 'node:path';

export function isProductionEnv(nodeEnv?: string): boolean {
  return nodeEnv === 'production';
}

export function resolveServerPort(
  rawPort?: string,
  fallback = 3000,
  nodeEnv?: string
): number {
  if (!isProductionEnv(nodeEnv)) {
    return fallback;
  }
  if (!rawPort) return fallback;
  const parsed = Number.parseInt(rawPort.trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 65535) {
    return fallback;
  }
  return parsed;
}

export function resolveStorageDir(
  defaultRelativeDir: string,
  envOverride: string | undefined,
  cwd: string = process.cwd()
): string {
  const target = envOverride && envOverride.trim().length > 0 ? envOverride.trim() : defaultRelativeDir;
  return path.isAbsolute(target) ? path.normalize(target) : path.resolve(cwd, target);
}

export function isSecureCookieRequest(options: {
  nodeEnv?: string;
  secure?: boolean;
  forwardedProto?: string | string[];
}): boolean {
  if (!isProductionEnv(options.nodeEnv)) {
    return false;
  }
  if (options.secure) {
    return true;
  }
  const proto = Array.isArray(options.forwardedProto)
    ? options.forwardedProto[0]
    : options.forwardedProto;
  return typeof proto === 'string' && proto.split(',')[0].trim().toLowerCase() === 'https';
}
