import { realtime } from "./realtime";

const STREAM_CHANNEL_PREFIX = "stream:";

export { realtime, schema } from "./realtime";

export type StreamChannel = ReturnType<typeof realtime.channel>;

export function streamChannel(streamId: string): StreamChannel {
  return realtime.channel(`${STREAM_CHANNEL_PREFIX}${streamId}`);
}
