import {
  List,
  Datagrid,
  TextField,
  EditButton,
  ShowButton,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  Show,
  SimpleShowLayout,
  NumberField,
  BooleanField,
  BooleanInput,
  ArrayInput,
  SimpleFormIterator,
  FilterButton,
  CreateButton,
  TopToolbar,
  FunctionField,
  useRecordContext,
  ListButton,
  useTranslate,
} from 'react-admin';
import { TimezoneAwareDateField } from '../../components/TimezoneAwareDateField';
import { Chip, Box, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Quote source choices component
const QuoteSourceChoices = () => {
  const translate = useTranslate();
  return [
    { id: 'BOOK', name: translate('resources.quotes.sourceType.BOOK') },
    { id: 'AUTHOR', name: translate('resources.quotes.sourceType.AUTHOR') },
  ];
};

const QuoteFilters = () => {
  const translate = useTranslate();
  const choices = QuoteSourceChoices();
  return [
    <SelectInput source="source" choices={choices} key="source" alwaysOn />,
    <TextInput source="author" key="author" label={translate('resources.quotes.fields.author')} />,
    <TextInput source="tag" key="tag" label={translate('resources.quotes.fields.tag')} />,
  ];
};

const SourceField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;

  const colors: Record<string, 'primary' | 'secondary'> = {
    BOOK: 'primary',
    AUTHOR: 'secondary',
  };

  const labels: Record<string, string> = {
    BOOK: translate('resources.quotes.sourceLabel.BOOK'),
    AUTHOR: translate('resources.quotes.sourceLabel.AUTHOR'),
  };

  return (
    <Chip
      label={labels[record.source] || record.source}
      color={colors[record.source] || 'default'}
      size="small"
    />
  );
};

const TagsField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record || !record.tags || record.tags.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {record.tags.map((tag: string, index: number) => (
        <Chip key={index} label={tag} size="small" variant="outlined" />
      ))}
    </Box>
  );
};

const ListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
  </TopToolbar>
);

export const QuoteList = () => {
  const translate = useTranslate();
  const filters = QuoteFilters();

  return (
    <List
      filters={filters}
      actions={<ListActions />}
      perPage={25}
      sort={{ field: 'createdAt', order: 'DESC' }}
    >
      <Datagrid rowClick="show">
        <FunctionField
          label={translate('resources.quotes.list.quote')}
          render={(record: { text?: string }) => (
            <Box sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {record?.text?.substring(0, 100)}...
            </Box>
          )}
        />
        <SourceField label={translate('resources.quotes.fields.source')} />
        <TextField source="author" label={translate('resources.quotes.fields.author')} />
        <TextField source="bookTitle" label={translate('resources.quotes.fields.bookTitle')} />
        <TagsField label={translate('resources.quotes.fields.tags')} />
        <NumberField source="likeCount" label={translate('resources.quotes.list.likes')} />
        <BooleanField source="isActive" label={translate('resources.quotes.list.active')} />
        <TimezoneAwareDateField source="createdAt" label={translate('resources.quotes.list.created')} />
        <EditButton />
        <ShowButton />
      </Datagrid>
    </List>
  );
};

export const QuoteEdit = () => {
  const translate = useTranslate();
  const choices = QuoteSourceChoices();

  return (
    <Edit>
      <SimpleForm>
        <TextInput source="text" multiline rows={4} fullWidth required label={translate('resources.quotes.form.quoteText')} />
        <TextInput source="textEn" multiline rows={4} fullWidth label={translate('resources.quotes.form.englishTranslation')} />

        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <SelectInput source="source" choices={choices} required label={translate('resources.quotes.fields.source')} />
          <TextInput source="author" fullWidth required label={translate('resources.quotes.fields.author')} />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <TextInput source="bookTitle" fullWidth label={translate('resources.quotes.form.bookTitle')} />
          <TextInput source="chapter" fullWidth label={translate('resources.quotes.form.chapter')} />
        </Stack>

        <Box sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>{translate('resources.quotes.sections.tags')}</Box>
        <ArrayInput source="tags" label="">
          <SimpleFormIterator inline>
            <TextInput source="" label={translate('resources.quotes.form.tag')} />
          </SimpleFormIterator>
        </ArrayInput>

        <Stack direction="row" spacing={2} sx={{ width: '100%', mt: 2 }}>
          <BooleanInput source="isActive" label={translate('resources.quotes.list.active')} />
        </Stack>
      </SimpleForm>
    </Edit>
  );
};

export const QuoteCreate = () => {
  const translate = useTranslate();
  const choices = QuoteSourceChoices();

  return (
    <Create>
      <SimpleForm>
        <TextInput source="text" multiline rows={4} fullWidth required label={translate('resources.quotes.form.quoteText')} />
        <TextInput source="textEn" multiline rows={4} fullWidth label={translate('resources.quotes.form.englishTranslation')} />

        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <SelectInput source="source" choices={choices} required defaultValue="BOOK" label={translate('resources.quotes.fields.source')} />
          <TextInput source="author" fullWidth required label={translate('resources.quotes.fields.author')} />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <TextInput source="bookTitle" fullWidth label={translate('resources.quotes.form.bookTitleForBookQuotes')} />
          <TextInput source="chapter" fullWidth label={translate('resources.quotes.form.chapter')} />
        </Stack>

        <Box sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>{translate('resources.quotes.sections.tags')}</Box>
        <ArrayInput source="tags" defaultValue={[]} label="">
          <SimpleFormIterator inline>
            <TextInput source="" label={translate('resources.quotes.form.tag')} />
          </SimpleFormIterator>
        </ArrayInput>

        <BooleanInput source="isActive" label={translate('resources.quotes.list.active')} defaultValue={true} />
      </SimpleForm>
    </Create>
  );
};

const ShowActions = () => {
  const translate = useTranslate();
  return (
    <TopToolbar sx={{ justifyContent: 'space-between', width: '100%' }}>
      <ListButton label={translate('common.back')} icon={<ArrowBackIcon />} />
      <EditButton />
    </TopToolbar>
  );
};

export const QuoteShow = () => {
  const translate = useTranslate();

  return (
    <Show actions={<ShowActions />}>
      <SimpleShowLayout>
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, fontStyle: 'italic', fontSize: 18 }}>
          <TextField source="text" />
        </Box>

        {/* English translation if exists */}
        <FunctionField
          render={(record: { textEn?: string }) =>
            record?.textEn ? (
              <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2, mt: 2 }}>
                <TextField source="textEn" />
              </Box>
            ) : null
          }
        />

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <SourceField />
          <BooleanField source="isActive" label={translate('resources.quotes.list.active')} />
        </Stack>

        <Box sx={{ mt: 2 }}>
          <Box sx={{ color: 'text.secondary', fontSize: 12 }}>{translate('resources.quotes.fields.author')}</Box>
          <TextField source="author" sx={{ fontWeight: 'bold' }} />
        </Box>

        <FunctionField
          render={(record: { bookTitle?: string; chapter?: string }) =>
            record?.bookTitle ? (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ color: 'text.secondary', fontSize: 12 }}>{translate('resources.quotes.sourceLabel.BOOK')}</Box>
                <Box>{record.bookTitle} {record.chapter ? `- ${record.chapter}` : ''}</Box>
              </Box>
            ) : null
          }
        />

        <Box sx={{ mt: 2 }}>
          <Box sx={{ color: 'text.secondary', fontSize: 12 }}>{translate('resources.quotes.fields.tags')}</Box>
          <TagsField />
        </Box>

        <Stack direction="row" spacing={4} sx={{ mt: 3 }}>
          <Box>
            <Box sx={{ color: 'text.secondary', fontSize: 12 }}>{translate('resources.quotes.list.likes')}</Box>
            <NumberField source="likeCount" />
          </Box>
          <Box>
            <Box sx={{ color: 'text.secondary', fontSize: 12 }}>{translate('resources.quotes.show.shares')}</Box>
            <NumberField source="shareCount" />
          </Box>
        </Stack>

        <TimezoneAwareDateField source="createdAt" showTime label={translate('resources.quotes.list.created')} />
        <TimezoneAwareDateField source="updatedAt" showTime label={translate('resources.quotes.show.updated')} />
      </SimpleShowLayout>
    </Show>
  );
};
