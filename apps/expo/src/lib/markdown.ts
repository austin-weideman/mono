import type { MarkdownParser } from "react-native-markdown-display";
import { Linking } from "react-native";
import { MarkdownIt } from "react-native-markdown-display";

export const markdownParser = (
  MarkdownIt as (options: {
    typographer: boolean;
    linkify: boolean;
  }) => MarkdownParser
)({
  typographer: true,
  linkify: true,
});

export function openLink(url: string): boolean {
  void Linking.openURL(url);
  return false;
}
