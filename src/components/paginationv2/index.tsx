import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem/PaginationItem';
import * as React from 'react';

const DEFAULT_PAGE_LIMIT = 5
export interface PageInfo {
  order: Order[]
  filter: Filter[]
  limit: number
  offset: number
  total: number
}

export interface Order {
  field: string
  direction: string
}

export interface Filter {
  field: string
  type: string
  val: string
}

export interface PaginationV2Props {
  pageInfo: PageInfo | null
  limit: number
  initPage: number
  pageHandler: (newOffset: number) => void
  onChange?: ((event: React.ChangeEvent<unknown>, page: number) => void) | undefined
}


export default function PaginationV2({ initPage = 1, pageInfo, onChange, pageHandler }: PaginationV2Props) {
  const [page, setPage] = React.useState(initPage)
  const pageCount = React.useMemo(() => {
    if (!pageInfo || pageInfo.limit === 0) {
      return 0
    }

    return Math.ceil(pageInfo.total / pageInfo.limit)
  }, [pageInfo]);

  React.useEffect(() => {
    if (!pageInfo || pageInfo.limit === 0) {
      return
    }

    if (!pageHandler) {
      return
    }

    pageHandler(pageInfo.limit * (page - 1))
  }, [pageInfo, page, pageHandler])


  if (!pageInfo) {
    return (
      <div>
        TODO: loading pages
      </div>
    )
  }

  return (
    <Pagination
      renderItem={(item) => (
        <PaginationItem
          sx={{
            width: "fit-content",
            minWidth: "23px",
            fontWeight: "500",
            "&.Mui-selected": {
              boxShadow: "2px 2px 6px rgba(86, 104, 117, 0.16)"
            }
          }}
          components={{

          }}
          {...item}
        />
      )}
      size="small"
      page={page}
      count={pageCount}
      color="primary"
      shape="rounded"
      onChange={(e, p) => {
        setPage(p)
        if (onChange) {
          onChange(e, p)
        }
      }} />
  );
}


export function usePage(limit: number, initPage: number = 1) {
  const [offset, setOffset] = React.useState((initPage - 1) * limit)
  const pageParams = React.useMemo(() => {
    return `limit=${limit}&offset=${offset}`
  }, [offset, limit])

  return [
    pageParams,
    React.useCallback((newOffset: number) => {
      if (newOffset !== offset) {
        setOffset(newOffset)
      }
    }, [offset, setOffset])
  ]
}

export interface PageHandler {
  pageParams: string
  page: number
  pageCount: number
  offset: number
  limit: number
  updatePage: (newPage: number) => void
  goToFirstPage: () => void
}

export function usePageHandler(limit: number, initPage: number = 1): PageHandler {
  const [page, setPage] = React.useState(initPage)
  const offset = React.useMemo(() => {
    return (page - 1) * limit
  }, [page, limit])

  const pageParams = React.useMemo(() => {
    return `limit=${limit}&offset=${offset}`
  }, [offset])

  const pageCount = 0

  const updatePage = React.useCallback((newPage: number) => {
    if (newPage !== page) {
      setPage(newPage)
    }
  }, [page, setPage])

  const goToFirstPage = React.useCallback(() => {
    setPage(1)
  }, [setPage])

  return {
    pageParams,
    page,
    offset,
    limit,
    pageCount,
    updatePage,
    goToFirstPage
  }
}


export interface PaginationV3Props {
  pageHandler: PageHandler
  pageInfo: PageInfo | null
}

export function PaginationV4({ pageHandler, pageInfo }: PaginationV3Props) {
  const pageCount = React.useMemo(() => {
    if (!pageInfo || pageInfo.limit === 0) {
      return 0
    }

    return Math.ceil(pageInfo.total / pageInfo.limit)
  }, [pageInfo]);


  if (!pageInfo) {
    return (
      <div>
        TODO: loading pages
      </div>
    )
  }

  return (
    <Pagination
      renderItem={(item) => (
        <PaginationItem
          sx={{
            width: "fit-content",
            minWidth: "23px",
            fontWeight: "500",
            "&.Mui-selected": {
              boxShadow: "2px 2px 6px rgba(86, 104, 117, 0.16)"
            }
          }}
          {...item}
        />
      )}
      size="small"
      page={pageHandler.page}
      count={pageCount}
      color="primary"
      shape="rounded"
      onChange={(e, p) => {
        pageHandler.updatePage(p)
      }} />
  );
}