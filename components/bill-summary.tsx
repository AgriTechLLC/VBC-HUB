"use client";
import useSWR from "swr";

export default function BillSummary({ billId }: { billId: string }) {
  const { data, error } = useSWR(`/api/bills/${billId}/summary`, (url: string) => fetch(url).then(r => r.json()));
  if (error) return <p className="text-red-500">Failed to load summary</p>;
  if (!data) return <p>Loading…</p>;
  return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: data.summary }} />;
}