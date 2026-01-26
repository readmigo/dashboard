import {
  List,
  Datagrid,
  TextField,
  FunctionField,
  TextInput,
  SelectInput,
  useRecordContext,
  TopToolbar,
  FilterButton,
  ExportButton,
  useTranslate,
} from 'react-admin';
import { TimezoneAwareDateField } from '../../components/TimezoneAwareDateField';
import { Chip, Box } from '@mui/material';

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  PENDING: 'warning',
  COMPLETED: 'success',
  FAILED: 'error',
  REFUNDED: 'secondary',
  PARTIALLY_REFUNDED: 'info',
  CANCELLED: 'default',
};

const StatusField = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;
  return (
    <Chip
      label={translate(`resources.orders.status.${record.status}`)}
      color={statusColors[record.status] || 'default'}
      size="small"
    />
  );
};

const AmountField = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <Box>
      {record.currency} {(record.amount / 100).toFixed(2)}
    </Box>
  );
};

const OrderFilters = () => {
  const translate = useTranslate();
  return [
    <TextInput key="search" source="search" label={translate('common.search')} alwaysOn />,
    <SelectInput
      key="status"
      source="status"
      label={translate('resources.orders.fields.status')}
      choices={[
        { id: 'PENDING', name: translate('resources.orders.status.PENDING') },
        { id: 'COMPLETED', name: translate('resources.orders.status.COMPLETED') },
        { id: 'FAILED', name: translate('resources.orders.status.FAILED') },
        { id: 'REFUNDED', name: translate('resources.orders.status.REFUNDED') },
        { id: 'PARTIALLY_REFUNDED', name: translate('resources.orders.status.PARTIALLY_REFUNDED') },
        { id: 'CANCELLED', name: translate('resources.orders.status.CANCELLED') },
      ]}
    />,
  ];
};

const ListActions = () => (
  <TopToolbar>
    <FilterButton />
    <ExportButton />
  </TopToolbar>
);

export const OrderList = () => {
  const translate = useTranslate();
  const orderFilters = OrderFilters();

  return (
    <List
      filters={orderFilters}
      actions={<ListActions />}
      sort={{ field: 'createdAt', order: 'DESC' }}
      perPage={25}
    >
      <Datagrid rowClick="show">
        <TextField source="orderNumber" label={translate('resources.orders.fields.orderNumber')} />
        <FunctionField
          label={translate('resources.orders.fields.user')}
          render={(record: { user?: { name?: string; email?: string } }) =>
            record?.user?.name || record?.user?.email || '-'
          }
        />
        <TextField source="productName" label={translate('resources.orders.fields.productName')} />
        <FunctionField
          label={translate('resources.orders.fields.amount')}
          render={() => <AmountField />}
        />
        <FunctionField
          label={translate('resources.orders.fields.status')}
          render={() => <StatusField />}
        />
        <TextField source="appleEnvironment" label={translate('resources.orders.fields.environment')} />
        <TimezoneAwareDateField source="createdAt" label={translate('resources.orders.fields.createdAt')} showTime />
      </Datagrid>
    </List>
  );
};
