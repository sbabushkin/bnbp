import React from "react";
import { visuallyHidden } from '@mui/utils';
import { headCells, IData } from '../../helpers/constants'
import Box from '@mui/material/Box';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from "@mui/material/TableSortLabel";

type Order = 'asc' | 'desc';

interface TableHeaderPropsType {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof IData) => void;
  order: Order;
  orderBy: string;
}

const TableHeader: React.FC<TableHeaderPropsType> = (props) => {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof IData) => (event: React.MouseEvent<unknown>) => {onRequestSort(event, property)};

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              width: headCell.id === 'name' ? '220px' : 'auto',
              minWidth: '60px',
              whiteSpace: 'nowrap',
            }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default TableHeader;