import { Button } from "@/components/ui/button";
import { Meta } from "@/types";

interface CustomPaginationProps {
  meta: Meta;
  onPageChange: (page: number) => void;
}

const CustomPagination = ({ meta, onPageChange }: CustomPaginationProps) => {
  const { currentPage, totalPages } = meta;

  if (totalPages < 7) {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, idx) => {
          const page = idx + 1;
          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              className="size-8 sm:size-10 rounded-sm"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          );
        })}
      </div>
    );
  }

  const createPageButton = (page: number) => (
    <Button
      key={page}
      variant={currentPage === page ? "default" : "outline"}
      size="sm"
      className="size-8 sm:size-10 rounded-sm"
      onClick={() => onPageChange(page)}
    >
      {page}
    </Button>
  );

  const createEllipsis = (key: string) => (
    <Button
      key={key}
      variant="outline"
      size="sm"
      className="size-8 sm:size-10 rounded-sm"
      disabled
    >
      ...
    </Button>
  );

  const pages = [];

  pages.push(createPageButton(1));

  if (currentPage > 4) {
    pages.push(createEllipsis("start"));
  }

  let startPage = Math.max(2, currentPage - 2);
  let endPage = Math.min(totalPages - 1, currentPage + 2);

  if (currentPage <= 4) {
    startPage = 2;
    endPage = Math.min(5, totalPages - 1);
  } else if (currentPage >= totalPages - 3) {
    startPage = Math.max(2, totalPages - 5);
    endPage = totalPages - 1;
  }

  for (let page = startPage; page <= endPage; page++) {
    pages.push(createPageButton(page));
  }

  if (currentPage < totalPages - 3) {
    pages.push(createEllipsis("end"));
  }

  if (totalPages > 1) {
    pages.push(createPageButton(totalPages));
  }

  return <div className="flex items-center gap-1">{pages}</div>;
};

export default CustomPagination;
