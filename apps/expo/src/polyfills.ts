import { Platform } from "react-native";
import { polyfillGlobal } from "react-native/Libraries/Utilities/PolyfillFunctions";
import {
  TextDecoderStream,
  TextEncoderStream,
} from "@stardazed/streams-text-encoding";
import structuredClone from "@ungap/structured-clone";

if (Platform.OS !== "web") {
  if (!("structuredClone" in global)) {
    polyfillGlobal("structuredClone", () => structuredClone);
  }

  polyfillGlobal("TextEncoderStream", () => TextEncoderStream);
  polyfillGlobal("TextDecoderStream", () => TextDecoderStream);
}

export {};
