import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';
import { Transaction } from '../types';

interface TransactionHistoryProps {
  transactions?: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions = [] }) => {
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'success';
      case 'sell':
        return 'error';
      case 'dividend':
        return 'info';
      case 'deposit':
        return 'success';
      case 'withdrawal':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Transaction History
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Symbol</TableCell>
                <TableCell align="right">Shares</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.timestamp), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.type}
                      color={getTransactionColor(transaction.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{transaction.symbol}</TableCell>
                  <TableCell align="right">{transaction.shares.toFixed(4)}</TableCell>
                  <TableCell align="right">{formatCurrency(transaction.price)}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(transaction.shares * transaction.price)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory; 