declare module "@ungap/structured-clone" {
  function structuredClone<T>(value: T): T;
  export default structuredClone;
}

declare module "react-native/Libraries/Utilities/PolyfillFunctions" {
  export function polyfillGlobal<T>(name: string, getValue: () => T): void;
}

declare module "@stardazed/streams-text-encoding" {
  export class TextEncoderStream extends TransformStream<string, Uint8Array> {
    readonly encoding: string;
  }
  export class TextDecoderStream extends TransformStream<Uint8Array, string> {
    readonly encoding: string;
    readonly fatal: boolean;
    readonly ignoreBOM: boolean;
  }
}
