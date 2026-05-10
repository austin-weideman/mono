import * as React from "react";
import { Font, Head } from "@react-email/components";

const INTER_WOFF2 =
  "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIq15j8eUY.woff2";

export function BrandHead(): React.ReactElement {
  return (
    <Head>
      <Font
        fontFamily="Inter"
        fallbackFontFamily="Arial"
        webFont={{ url: INTER_WOFF2, format: "woff2" }}
        fontWeight={400}
        fontStyle="normal"
      />
      <Font
        fontFamily="Inter"
        fallbackFontFamily="Arial"
        webFont={{ url: INTER_WOFF2, format: "woff2" }}
        fontWeight={500}
        fontStyle="normal"
      />
    </Head>
  );
}
