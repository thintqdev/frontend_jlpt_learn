"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface SmartPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export default function SmartPagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: SmartPaginationProps) {
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 7; // Maximum number of page buttons to show

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Always show first page
      items.push(1);

      const startRange = Math.max(2, currentPage - 1);
      const endRange = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis if there's a gap after first page
      if (startRange > 2) {
        items.push("...");
      }

      // Add pages around current page
      for (let i = startRange; i <= endRange; i++) {
        items.push(i);
      }

      // Add ellipsis if there's a gap before last page
      if (endRange < totalPages - 1) {
        items.push("...");
      }

      // Always show last page (if different from first)
      if (totalPages > 1) {
        items.push(totalPages);
      }
    }

    return items;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="pt-6">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (!disabled && currentPage > 1) {
                  onPageChange(currentPage - 1);
                }
              }}
              className={
                currentPage === 1 || disabled
                  ? "pointer-events-none opacity-50"
                  : undefined
              }
            />
          </PaginationItem>
          {generatePaginationItems().map((page, index) => (
            <PaginationItem key={index}>
              {page === "..." ? (
                <span className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <PaginationLink
                  href="#"
                  isActive={currentPage === page}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!disabled) {
                      onPageChange(page as number);
                    }
                  }}
                  className={`${
                    disabled ? "pointer-events-none opacity-50" : ""
                  } ${
                    currentPage === page
                      ? "bg-red-500 hover:bg-red-600 text-white border-red-500 rounded-full"
                      : "rounded-full"
                  }`}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (!disabled && currentPage < totalPages) {
                  onPageChange(currentPage + 1);
                }
              }}
              className={
                currentPage === totalPages || disabled
                  ? "pointer-events-none opacity-50"
                  : undefined
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
