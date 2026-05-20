"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { History } from "lucide-react";
import { ConversationHistory } from "./conversation-history";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const MobileConversationHistory = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <History className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0 w-80">
        <ConversationHistory />
      </SheetContent>
    </Sheet>
  );
};
