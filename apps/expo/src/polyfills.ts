import { Platform } from "react-native";
import structuredClone from "@ungap/structured-clone";
import { polyfillGlobal } from "react-native/Libraries/Utilities/PolyfillFunctions";

if (Platform.OS !== "web") {
  const setupPolyfills = async () => {
    const { TextEncoderStream, TextDecoderStream } = await import(
      "@stardazed/streams-text-encoding"
    );

    if (!("structuredClone" in global)) {
      polyfillGlobal("structuredClone", () => structuredClone);
    }

    polyfillGlobal("TextEncoderStream", () => TextEncoderStream);
    polyfillGlobal("TextDecoderStream", () => TextDecoderStream);
  };

  void setupPolyfills();
}

export {};
