"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserToast({
  show,
  message,
}: {
  show: boolean;
  message: string;
}) {
  const router = useRouter();
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (!show) return;
    const timeout = setTimeout(() => {
      setVisible(false);
      router.replace("/user");
    }, 3000);
    return () => clearTimeout(timeout);
  }, [router, show]);

  if (!visible) return null;

  return (
    <div className="fixed right-6 top-6 z-50 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary shadow-sm">
      {message}
    </div>
  );
}
