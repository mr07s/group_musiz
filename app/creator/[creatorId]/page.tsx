"use client";
import Dashboard from "@/app/components/Dashboard";
import { useParams } from "next/navigation";
export default function Creator() {
  const { creatorId } = useParams<{ creatorId: string }>();
  return (
    <div>
      <Dashboard creatorId={creatorId} playVideo={false} />
    </div>
  );
}
