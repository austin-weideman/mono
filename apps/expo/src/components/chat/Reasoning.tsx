import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown, ChevronRight } from "lucide-react-native";

import { fontSize, sizing, spacing, useTheme } from "~/lib";

const CHEVRON_SIZE = 14;
const LINE_HEIGHT_SM = 20;

interface ReasoningProps {
  text: string;
  isStreaming?: boolean;
}

export function Reasoning({ text, isStreaming }: ReasoningProps) {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text && !isStreaming) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { borderColor: colors.border, backgroundColor: colors.surfaceMuted },
      ]}
    >
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.header}
      >
        {isExpanded ? (
          <ChevronDown size={CHEVRON_SIZE} color={colors.textMuted} />
        ) : (
          <ChevronRight size={CHEVRON_SIZE} color={colors.textMuted} />
        )}
        <Text style={[styles.headerText, { color: colors.textMuted }]}>
          {isStreaming ? "Thinking..." : "Thought process"}
        </Text>
        {isStreaming && (
          <View
            style={[styles.streamingDot, { backgroundColor: colors.primary }]}
          />
        )}
      </Pressable>
      {isExpanded && (
        <View style={[styles.content, { borderTopColor: colors.border }]}>
          <Text style={[styles.contentText, { color: colors.textMuted }]}>
            {text}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: sizing.radiusSm,
    borderWidth: 1,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  streamingDot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.xs,
    marginLeft: spacing.xs,
  },
  content: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  contentText: {
    fontSize: fontSize.sm,
    lineHeight: LINE_HEIGHT_SM,
  },
});
