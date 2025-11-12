"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QueueStatusTabsProps {
  value: string;
  onChange: (value: string) => void;
}

export default function QueueStatusTabs({
  value,
  onChange,
}: QueueStatusTabsProps) {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList className="p-2 h-fit">
        <TabsTrigger className="p-2 px-4" value="all">All</TabsTrigger>
        <TabsTrigger className="p-2 px-4" value="Waiting">Waiting</TabsTrigger>
        <TabsTrigger className="p-2 px-4" value="Vitals">Vitals</TabsTrigger>
        <TabsTrigger className="p-2 px-4" value="Consultation">Consultation</TabsTrigger>
        <TabsTrigger className="p-2 px-4" value="Completed">Completed</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
