export type AppConfig = {
  appSecret: string;
  livekitUrl: string;
  livekitApiKey: string;
  livekitApiSecret: string;
  roomTokenTtlSeconds: number;
};

export function getAppConfig(): AppConfig {
  const appSecret = requireEnv("APP_SECRET");
  const livekitUrl = requireEnv("LIVEKIT_URL");
  const livekitApiKey = requireEnv("LIVEKIT_API_KEY");
  const livekitApiSecret = requireEnv("LIVEKIT_API_SECRET");

  return {
    appSecret,
    livekitUrl,
    livekitApiKey,
    livekitApiSecret,
    roomTokenTtlSeconds: parsePositiveInt(
      process.env.ROOM_TOKEN_TTL_SECONDS,
      3600,
    ),
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
