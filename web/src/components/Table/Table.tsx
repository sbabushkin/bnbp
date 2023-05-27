import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { IData } from '../../helpers/constants'
import { chunkNumberByClass } from '../../utils/formatPrice';
import Link from '@mui/material/Link'
import TableToolbar from './TableToolbar';
import { Order, getComparator, stableSort } from './table-helpers';
import TableHeader from './TableHeader';
import { usePropertyStore } from '../../store/propertyStore';
import PropertyForm from '../PropertyForm';

export default function PropertyTable() {
  const [order, setOrder] = React.useState<Order>('asc');
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [orderBy, setOrderBy] = React.useState<keyof IData>('propertyType');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  const nodes = usePropertyStore((store) => store.nodes)
  const actions = usePropertyStore((store) => store.actions)

  React.useEffect(() => {
    actions.fetchData();
  }, []);

  const handleRequestSort = (
    _: React.MouseEvent<unknown>,
    property: keyof IData,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - nodes.length) : 0;

  const visibleRows = React.useMemo(() =>
    stableSort(nodes, getComparator(order, orderBy)).slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    ), [order, orderBy, page, rowsPerPage, nodes]);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableToolbar />

        <TableContainer sx={{ maxHeight: 'calc(100vh - 130px)' }}>
          <Table
            sx={{ minWidth: 750 }}
            aria-label="sticky table"
            size={'small'}
            stickyHeader
          >
            <TableHeader
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {visibleRows.map((row) => (
                <TableRow
                  tabIndex={-1}
                  key={row.id}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setOpenId(row.id)}
                >
                  <TableCell><Link href={row.url} target='_blank' onClick={(e) => e.stopPropagation()}>{row.name}</Link></TableCell>
                  <TableCell>{row.source}</TableCell>
                  <TableCell>{row.propertyType}</TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>{row.bedroomsCount}</TableCell>
                  <TableCell>{row.bathroomsCount}</TableCell>
                  <TableCell>{row.landSize}</TableCell>
                  <TableCell>{row.buildingSize}</TableCell>
                  <TableCell>{chunkNumberByClass(row.priceIdr)}</TableCell>
                  <TableCell>{chunkNumberByClass(row.priceUsd)}</TableCell>
                </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow style={{height: 33 * emptyRows}}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[25, 50]}
          component="div"
          count={nodes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <PropertyForm openId={openId} setOpenId={setOpenId} />
    </Box>
  );
}
