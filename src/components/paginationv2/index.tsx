import * as React from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

export default function PaginationV2() {
  return (
    // <Stack spacing={2}>
      <Pagination count={10} color="primary" shape="rounded" />
    // </Stack>
  );
}