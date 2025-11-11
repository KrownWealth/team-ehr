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
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="Waiting">Waiting</TabsTrigger>
        <TabsTrigger value="Vitals">Vitals</TabsTrigger>
        <TabsTrigger value="Consultation">Consultation</TabsTrigger>
        <TabsTrigger value="Completed">Completed</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
