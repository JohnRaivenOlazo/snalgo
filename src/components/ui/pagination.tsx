
import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import PixelButton from "./PixelButton"

interface PaginationProps {
  className?: string;
  count: number;
  page: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}

const Pagination = ({
  className,
  count,
  page,
  onChange,
  disabled,
  ...props
}: PaginationProps) => {
  const renderPageLinks = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(0, Math.min(page - Math.floor(maxVisiblePages / 2), count - maxVisiblePages))
    let endPage = Math.min(count - 1, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1)
    }

    if (startPage > 0) {
      pages.push(
        <div key="start-ellipsis" className="flex items-center justify-center">
          <MoreHorizontal className="h-4 w-4" />
        </div>
      )
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PixelButton
          key={i}
          variant={i === page ? "primary" : "secondary"}
          size="sm"
          onClick={() => onChange(i)}
          disabled={disabled}
          aria-current={i === page ? "page" : undefined}
        >
          {i + 1}
        </PixelButton>
      )
    }

    if (endPage < count - 1) {
      pages.push(
        <div key="end-ellipsis" className="flex items-center justify-center">
          <MoreHorizontal className="h-4 w-4" />
        </div>
      )
    }

    return pages
  }

  return (
    <div
      className={cn("flex items-center gap-1 justify-center", className)}
      {...props}
    >
      <PixelButton
        variant="secondary"
        size="sm"
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page === 0 || disabled}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </PixelButton>
      <div className="flex items-center gap-1 px-1">{renderPageLinks()}</div>
      <PixelButton
        variant="secondary"
        size="sm"
        onClick={() => onChange(Math.min(count - 1, page + 1))}
        disabled={page === count - 1 || disabled}
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </PixelButton>
    </div>
  )
}

export { Pagination }
