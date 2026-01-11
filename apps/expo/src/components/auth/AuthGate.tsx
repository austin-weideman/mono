import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sparkles } from "lucide-react-native";

import { useTheme } from "~/lib";
import { authClient } from "~/utils/auth";
import { TimezoneSync } from "./TimezoneSync";

const FEATURES = [
  {
    icon: "💬",
    title: "Smart Conversations",
    description: "Chat naturally with AI that understands context",
  },
  {
    icon: "📚",
    title: "Bite-Sized Learning",
    description: "Break down complex topics into manageable chunks",
  },
  {
    icon: "🎯",
    title: "Personalized",
    description: "Tailored to your pace and learning style",
  },
] as const;

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.featureCard, { backgroundColor: colors.cardBackground }]}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
      <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  );
}

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { colors } = useTheme();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!session?.user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          <View style={styles.content}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${colors.primary}20` },
              ]}
            >
              <Sparkles size={32} color={colors.primary} />
            </View>

            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Micro<Text style={{ color: colors.primary }}>Learn</Text>
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Your personal AI tutor for microlearning. Learn anything, one
                conversation at a time.
              </Text>
            </View>

            <Pressable
              onPress={() =>
                authClient.signIn.social({
                  provider: "google",
                  callbackURL: "/",
                })
              }
              style={[styles.signInButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.signInButtonText, { color: colors.textOnPrimary }]}>
                Sign in with Google
              </Text>
            </Pressable>

            <View style={styles.featuresContainer}>
              {FEATURES.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <>
      <TimezoneSync />
      {children}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  content: {
    alignItems: "center",
    gap: 24,
    paddingVertical: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 24,
  },
  signInButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    width: "100%",
    marginTop: 16,
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  featuresContainer: {
    width: "100%",
    gap: 12,
    marginTop: 32,
  },
  featureCard: {
    borderRadius: 12,
    padding: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
