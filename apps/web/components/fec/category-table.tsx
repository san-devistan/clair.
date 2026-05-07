"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { groupSmallCategoryBreakdowns } from "@/components/fec/category-breakdown-display"
import { FormattedCurrency } from "@/components/fec/formatted-number"
import type { CategoryBreakdown } from "@/lib/fec/analytics"

export function CategoryTable({ items }: { items: CategoryBreakdown[] }) {
  const displayedItems = groupSmallCategoryBreakdowns(items)

  if (displayedItems.length === 0)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Aucune catégorie à afficher
      </p>
    )

  return (
    <div className="rounded-md border">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead>Catégorie</TableHead>
            <TableHead className="w-20 text-right">Part</TableHead>
            <TableHead className="w-28 text-right">Montant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedItems.map((item) => (
            <TableRow key={item.key}>
              <TableCell className="font-medium">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden
                    className="block size-2.5 shrink-0 rounded-full"
                    style={{ background: item.fill }}
                  />
                  <span className="min-w-0 truncate">{item.label}</span>
                </div>
              </TableCell>
              <TableCell className="text-right text-muted-foreground tabular-nums">
                {item.share.toFixed(1)}%
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                <FormattedCurrency value={item.amount} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
