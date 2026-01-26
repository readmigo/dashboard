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
import { Chip, Rating } from '@mui/material';

const categoryColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  BUG: 'error',
  FEATURE_REQUEST: 'info',
  UI_UX: 'primary',
  CONTENT: 'secondary',
  PERFORMANCE: 'warning',
  OTHER: 'default',
};

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  NEW: 'info',
  ACKNOWLEDGED: 'primary',
  UNDER_REVIEW: 'warning',
  PLANNED: 'secondary',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  WONT_FIX: 'default',
  DUPLICATE: 'default',
};

const CategoryField = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;
  return (
    <Chip
      label={translate(`resources.feedback.category.${record.category}`)}
      color={categoryColors[record.category] || 'default'}
      size="small"
    />
  );
};

const StatusField = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;
  return (
    <Chip
      label={translate(`resources.feedback.status.${record.status}`)}
      color={statusColors[record.status] || 'default'}
      size="small"
    />
  );
};

const RatingField = () => {
  const record = useRecordContext();
  if (!record || record.rating === null || record.rating === undefined) return <span>-</span>;
  return <Rating value={record.rating} readOnly size="small" />;
};

const useFeedbackFilters = () => {
  const translate = useTranslate();
  return [
    <TextInput key="search" source="search" label={translate('common.search')} alwaysOn />,
    <SelectInput
      key="category"
      source="category"
      label={translate('resources.feedback.fields.category')}
      choices={[
        { id: 'BUG', name: translate('resources.feedback.category.BUG') },
        { id: 'FEATURE_REQUEST', name: translate('resources.feedback.category.FEATURE_REQUEST') },
        { id: 'UI_UX', name: translate('resources.feedback.category.UI_UX') },
        { id: 'CONTENT', name: translate('resources.feedback.category.CONTENT') },
        { id: 'PERFORMANCE', name: translate('resources.feedback.category.PERFORMANCE') },
        { id: 'OTHER', name: translate('resources.feedback.category.OTHER') },
      ]}
    />,
    <SelectInput
      key="status"
      source="status"
      label={translate('resources.feedback.fields.status')}
      choices={[
        { id: 'NEW', name: translate('resources.feedback.status.NEW') },
        { id: 'ACKNOWLEDGED', name: translate('resources.feedback.status.ACKNOWLEDGED') },
        { id: 'UNDER_REVIEW', name: translate('resources.feedback.status.UNDER_REVIEW') },
        { id: 'PLANNED', name: translate('resources.feedback.status.PLANNED') },
        { id: 'IN_PROGRESS', name: translate('resources.feedback.status.IN_PROGRESS') },
        { id: 'COMPLETED', name: translate('resources.feedback.status.COMPLETED') },
        { id: 'WONT_FIX', name: translate('resources.feedback.status.WONT_FIX') },
        { id: 'DUPLICATE', name: translate('resources.feedback.status.DUPLICATE') },
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

export const FeedbackList = () => {
  const translate = useTranslate();
  const feedbackFilters = useFeedbackFilters();

  return (
    <List
      filters={feedbackFilters}
      actions={<ListActions />}
      sort={{ field: 'createdAt', order: 'DESC' }}
      perPage={25}
    >
      <Datagrid rowClick="show">
        <FunctionField
          label={translate('resources.feedback.fields.category')}
          render={() => <CategoryField />}
        />
        <FunctionField
          label={translate('resources.feedback.fields.status')}
          render={() => <StatusField />}
        />
        <FunctionField
          label={translate('resources.feedback.fields.rating')}
          render={() => <RatingField />}
        />
        <FunctionField
          label={translate('resources.feedback.fields.content')}
          render={(record: { content?: string }) =>
            record?.content ? record.content.slice(0, 100) + (record.content.length > 100 ? '...' : '') : ''
          }
        />
        <FunctionField
          label={translate('resources.feedback.fields.user')}
          render={(record: { user?: { name?: string; email?: string } }) =>
            record?.user?.name || record?.user?.email || '-'
          }
        />
        <TextField source="appVersion" label={translate('resources.feedback.fields.appVersion')} />
        <TimezoneAwareDateField source="createdAt" label={translate('resources.feedback.fields.createdAt')} showTime />
      </Datagrid>
    </List>
  );
};
