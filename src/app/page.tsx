import { Suspense } from "react";

import { IntakeExperience } from "@/components/intake-experience";

export default function Home() {
  return (
    <Suspense>
      <IntakeExperience />
    </Suspense>
  );
}
