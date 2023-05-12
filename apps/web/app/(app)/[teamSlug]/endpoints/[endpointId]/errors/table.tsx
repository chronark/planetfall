"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";

import Link from "next/link";
import { ChevronRight, Minus } from "lucide-react";
import { Badge } from "@/components/badge";

type ErrorCheck = {
  id: string;
  detailsUrl: string;
  time: number;
  region: string;
  error: string;
  latency?: number;
  status?: number;
};

export type Props = {
  errors: ErrorCheck[];
};

export const ErrorsTable: React.FC<Props> = ({ errors }): JSX.Element => {
  const rows = errors.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <Table className="-mx-4">
      <TableCaption>A list of errors in the last 24h.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead>Error</TableHead>
          <TableHead className="text-right">Latency</TableHead>
          <TableHead className="text-right">Region</TableHead>
          <TableHead className="text-right">Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{new Date(row.time).toLocaleString()}</TableCell>
            <TableCell className="flex items-center justify-center ">
              {row.status ? (
                <Badge>{row.status}</Badge>
              ) : (
                <Minus className="w-4 h-4 text-zinc-400" />
              )}
            </TableCell>
            <TableCell>{row.error}</TableCell>
            <TableCell className="flex items-center justify-end">
              {row.latency ? (
                <Badge>{row.latency}</Badge>
              ) : (
                <Minus className="w-4 h-4 text-zinc-400" />
              )}
            </TableCell>
            <TableCell className="text-right">{row.region}</TableCell>
            <TableCell className="flex items-center justify-end text-right">
              <Link href={row.detailsUrl}>
                <ChevronRight className="duration-150 text-zinc-500 hover:text-zinc-800" />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
