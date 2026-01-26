import {
  Show,
  useRecordContext,
  useDataProvider,
  useRefresh,
  useNotify,
  useTranslate,
} from 'react-admin';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Divider,
  TextField as MuiTextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useState } from 'react';
import RefundIcon from '@mui/icons-material/MoneyOff';
import { useTimezone } from '../../contexts/TimezoneContext';

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  PENDING: 'warning',
  COMPLETED: 'success',
  FAILED: 'error',
  REFUNDED: 'secondary',
  PARTIALLY_REFUNDED: 'info',
  CANCELLED: 'default',
};

const refundStatusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  PENDING: 'warning',
  APPROVED: 'info',
  REJECTED: 'error',
  PROCESSED: 'success',
  CANCELLED: 'default',
};

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
}

interface RefundRequest {
  id: string;
  type: string;
  status: string;
  requestedAmount: number;
  approvedAmount?: number;
  reason: string;
  createdAt: string;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  userId: string;
  user?: { name?: string; email?: string };
  subscriptionId?: string;
  status: string;
  productId: string;
  productName: string;
  amount: number;
  currency: string;
  appleTransactionId?: string;
  appleOriginalTransactionId?: string;
  appleEnvironment?: string;
  refundedAmount?: number;
  refundedAt?: string;
  transactions?: Transaction[];
  refundRequests?: RefundRequest[];
  createdAt: string;
  updatedAt: string;
}

const OrderDetails = () => {
  const record = useRecordContext<OrderRecord>();
  const translate = useTranslate();
  const { formatDateTime } = useTimezone();

  if (!record) return null;

  const formatAmount = (amount: number, currency: string) => {
    return `${currency} ${(amount / 100).toFixed(2)}`;
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">#{record.orderNumber}</Typography>
              <Chip
                label={translate(`resources.orders.status.${record.status}`)}
                color={statusColors[record.status] || 'default'}
              />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              {translate('resources.orders.fields.productName')}
            </Typography>
            <Typography variant="h6">{record.productName}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              {translate('resources.orders.fields.amount')}
            </Typography>
            <Typography variant="h6">
              {formatAmount(record.amount, record.currency)}
              {record.refundedAmount && record.refundedAmount > 0 && (
                <Typography component="span" color="error" sx={{ ml: 1 }}>
                  (-{formatAmount(record.refundedAmount, record.currency)})
                </Typography>
              )}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              {translate('resources.orders.fields.user')}
            </Typography>
            <Typography>{record.user?.name || record.user?.email || '-'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              {translate('resources.orders.fields.createdAt')}
            </Typography>
            <Typography>{formatDateTime(record.createdAt)}</Typography>
          </Grid>
          {record.appleTransactionId && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  {translate('resources.orders.appleTransactionDetails')}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">{translate('resources.orders.transactionId')}</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {record.appleTransactionId}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">{translate('resources.orders.fields.environment')}</Typography>
                <Chip
                  label={record.appleEnvironment}
                  size="small"
                  color={record.appleEnvironment === 'PRODUCTION' ? 'success' : 'warning'}
                />
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

const TransactionHistory = () => {
  const record = useRecordContext<OrderRecord>();
  const translate = useTranslate();
  const { formatDateTime } = useTimezone();

  if (!record?.transactions?.length) return null;

  const formatAmount = (amount: number, currency: string) => {
    return `${currency} ${(amount / 100).toFixed(2)}`;
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {translate('resources.orders.transactions')}
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{translate('resources.orders.transactionFields.type')}</TableCell>
                <TableCell>{translate('resources.orders.transactionFields.status')}</TableCell>
                <TableCell align="right">{translate('resources.orders.transactionFields.amount')}</TableCell>
                <TableCell>{translate('resources.orders.transactionFields.date')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {record.transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>
                    <Chip
                      label={tx.status}
                      size="small"
                      color={tx.status === 'SUCCESS' ? 'success' : tx.status === 'FAILED' ? 'error' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ color: tx.amount < 0 ? 'error.main' : 'inherit' }}>
                    {formatAmount(tx.amount, tx.currency)}
                  </TableCell>
                  <TableCell>{formatDateTime(tx.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const RefundPanel = () => {
  const record = useRecordContext<OrderRecord>();
  const dataProvider = useDataProvider();
  const refresh = useRefresh();
  const notify = useNotify();
  const translate = useTranslate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refundType, setRefundType] = useState('FULL');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!record) return null;

  const canRefund = record.status === 'COMPLETED' || record.status === 'PARTIALLY_REFUNDED';
  const remainingAmount = record.amount - (record.refundedAmount || 0);

  const handleCreateRefund = async () => {
    setLoading(true);
    try {
      await dataProvider.create(`admin/orders/${record.id}/refund`, {
        data: {
          type: refundType,
          amount: refundType === 'PARTIAL' ? parseInt(refundAmount) * 100 : undefined,
          reason: refundReason,
        },
      });
      refresh();
      notify(translate('resources.orders.notifications.refundCreated'), { type: 'success' });
      setDialogOpen(false);
      setRefundReason('');
      setRefundAmount('');
    } catch (error) {
      notify(translate('resources.orders.notifications.refundCreateError'), { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async (refundId: string, status: string) => {
    setLoading(true);
    try {
      await dataProvider.update(`admin/orders/refunds`, {
        id: refundId,
        data: { status },
        previousData: {},
      });
      refresh();
      notify(translate('resources.orders.notifications.refundProcessed'), { type: 'success' });
    } catch (error) {
      notify(translate('resources.orders.notifications.refundProcessError'), { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {translate('resources.orders.refunds')}
          </Typography>
          {canRefund && (
            <Button
              variant="contained"
              color="warning"
              startIcon={<RefundIcon />}
              onClick={() => setDialogOpen(true)}
              disabled={loading || remainingAmount <= 0}
              fullWidth
              sx={{ mb: 2 }}
            >
              {translate('resources.orders.createRefund')}
            </Button>
          )}
          {record.refundRequests && record.refundRequests.length > 0 && (
            <Box sx={{ mt: 2 }}>
              {record.refundRequests.map((request) => (
                <Paper key={request.id} sx={{ p: 2, mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Chip
                        label={translate(`resources.orders.refundStatus.${request.status}`)}
                        size="small"
                        color={refundStatusColors[request.status] || 'default'}
                      />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {translate(`resources.orders.refundTypes.${request.type.toLowerCase()}`)} - {record.currency} {(request.requestedAmount / 100).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {request.reason}
                      </Typography>
                    </Box>
                    {request.status === 'PENDING' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          color="success"
                          onClick={() => handleProcessRefund(request.id, 'APPROVED')}
                          disabled={loading}
                        >
                          {translate('resources.orders.actions.approve')}
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleProcessRefund(request.id, 'REJECTED')}
                          disabled={loading}
                        >
                          {translate('resources.orders.actions.reject')}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{translate('resources.orders.createRefund')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{translate('resources.orders.refundType')}</InputLabel>
              <Select
                value={refundType}
                label={translate('resources.orders.refundType')}
                onChange={(e) => setRefundType(e.target.value)}
              >
                <MenuItem value="FULL">{translate('resources.orders.refundTypes.full')}</MenuItem>
                <MenuItem value="PARTIAL">{translate('resources.orders.refundTypes.partial')}</MenuItem>
                <MenuItem value="PRORATED">{translate('resources.orders.refundTypes.prorated')}</MenuItem>
              </Select>
            </FormControl>
            {refundType === 'PARTIAL' && (
              <MuiTextField
                fullWidth
                label={translate('resources.orders.fields.amount')}
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                helperText={`${translate('resources.orders.maxAmount')}: ${record.currency} ${(remainingAmount / 100).toFixed(2)}`}
              />
            )}
            <MuiTextField
              fullWidth
              multiline
              rows={3}
              label={translate('resources.orders.refundReason')}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{translate('common.cancel')}</Button>
          <Button
            onClick={handleCreateRefund}
            variant="contained"
            color="warning"
            disabled={loading || !refundReason}
          >
            {translate('resources.orders.createRefund')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const OrderShow = () => {
  return (
    <Show>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <OrderDetails />
            <TransactionHistory />
          </Grid>
          <Grid item xs={4}>
            <RefundPanel />
          </Grid>
        </Grid>
      </Box>
    </Show>
  );
};
