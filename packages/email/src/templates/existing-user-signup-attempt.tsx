import * as React from "react";
import {
  Body,
  Container,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { BrandHead } from "./brand-head";
import { styles } from "./styles";

export interface ExistingUserSignupAttemptEmailProps {
  email: string;
}

export function ExistingUserSignupAttemptEmail({
  email,
}: ExistingUserSignupAttemptEmailProps): React.ReactElement {
  return (
    <Html>
      <BrandHead />
      <Preview>Someone tried to sign up with your BillSentry email</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.logo}>BillSentry</Text>
          </Section>

          <Heading style={styles.heading}>
            Sign-up attempt with your email
          </Heading>

          <Text style={styles.paragraph}>
            Someone tried to create a BillSentry account using{" "}
            <strong>{email}</strong>.
          </Text>

          <Text style={styles.paragraph}>
            If this was you, your account already exists — sign in with Google
            on the email address you used before. If it wasn't you, you can
            safely ignore this email; no new account was created.
          </Text>

          <Hr style={styles.hr} />

          <Text style={styles.footerBrand}>BillSentry</Text>
        </Container>
      </Body>
    </Html>
  );
}
