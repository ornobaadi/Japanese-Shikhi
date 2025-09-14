import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Button variant="destructive" size="lg" className="rounded-full">
        <CirclePlus />
        Click me</Button>
    </div>
  );
}
