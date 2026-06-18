import * as React from "react";
import {
  Body,
  Button,
  Container,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { BrandHead } from "./brand-head";
import { styles } from "./styles";

export interface VerifyEmailProps {
  name: string;
  url: string;
}

export function VerifyEmail({
  name,
  url,
}: VerifyEmailProps): React.ReactElement {
  const firstName = name.split(" ")[0] ?? name;

  return (
    <Html>
      <BrandHead />
      <Preview>Verify your email to get started with Autolab</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.logo}>Autolab</Text>
          </Section>

          <Heading style={styles.heading}>Verify your email</Heading>

          <Text style={styles.paragraph}>
            Hi {firstName}, welcome to Autolab. Click the button below to verify
            your email address and get started.
          </Text>

          <Section style={styles.buttonContainer}>
            <Button href={url} style={styles.button}>
              Verify email
            </Button>
          </Section>

          <Text style={styles.paragraph}>
            Or paste this link into your browser:
          </Text>
          <Link href={url} style={styles.fallbackLink}>
            {url}
          </Link>

          <Hr style={styles.hr} />

          <Text style={styles.footer}>
            If you didn't sign up for Autolab, you can safely ignore this email.
          </Text>
          <Text style={styles.footerBrand}>Autolab</Text>
        </Container>
      </Body>
    </Html>
  );
}
