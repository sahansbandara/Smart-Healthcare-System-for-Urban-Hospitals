import { Suspense } from "react";
import AppointmentsClient from "./pageClient";

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-foreground/70">Loading...</div>}>
      <AppointmentsClient />
    </Suspense>
  );
}
