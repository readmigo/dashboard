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
  NumberInput,
  FilterButton,
  TopToolbar,
  FunctionField,
  useRecordContext,
  ListButton,
  useTranslate,
} from 'react-admin';
import { TimezoneAwareDateField } from '../../components/TimezoneAwareDateField';
import { Chip, Box, Stack, Card, CardMedia } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// ============================================================
// Postcard Templates Management
// ============================================================

export const PostcardTemplateList = () => {
  const translate = useTranslate();

  return (
    <List
      perPage={25}
      sort={{ field: 'sortOrder', order: 'ASC' }}
    >
      <Datagrid rowClick="edit">
        <FunctionField
          label={translate('resources.postcards.list.preview')}
          render={(record: { previewUrl?: string; backgroundColor?: string }) => (
            <Box
              sx={{
                width: 80,
                height: 50,
                bgcolor: record?.backgroundColor || '#eee',
                borderRadius: 1,
                backgroundImage: record?.previewUrl ? `url(${record.previewUrl})` : 'none',
                backgroundSize: 'cover',
              }}
            />
          )}
        />
        <TextField source="name" label={translate('resources.postcards.fields.name')} />
        <FunctionField
          label={translate('resources.postcards.list.style')}
          render={(record: { fontFamily?: string; fontColor?: string }) => (
            <Box sx={{ fontFamily: record?.fontFamily, color: record?.fontColor }}>
              {record?.fontFamily}
            </Box>
          )}
        />
        <FunctionField
          label={translate('resources.postcards.list.background')}
          render={(record: { backgroundColor?: string }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: record?.backgroundColor,
                  borderRadius: '50%',
                  border: '1px solid #ddd',
                }}
              />
              <span>{record?.backgroundColor}</span>
            </Box>
          )}
        />
        <BooleanField source="isPremium" label={translate('resources.postcards.fields.isPremium')} />
        <BooleanField source="isActive" label={translate('resources.postcards.fields.isActive')} />
        <NumberField source="sortOrder" label={translate('resources.postcards.fields.sortOrder')} />
        <EditButton />
      </Datagrid>
    </List>
  );
};

export const PostcardTemplateEdit = () => {
  const translate = useTranslate();

  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" fullWidth required label={translate('resources.postcards.fields.name')} />
        <TextInput source="previewUrl" fullWidth label={translate('resources.postcards.fields.previewUrl')} />

        <Box sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>{translate('resources.postcards.sections.styleSettings')}</Box>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <TextInput source="backgroundColor" label={translate('resources.postcards.fields.backgroundColor')} placeholder="#FFFFFF" />
          <TextInput source="fontFamily" label={translate('resources.postcards.fields.fontFamily')} placeholder="Merriweather" />
          <TextInput source="fontColor" label={translate('resources.postcards.fields.fontColor')} placeholder="#333333" />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ width: '100%', mt: 2 }}>
          <BooleanInput source="isPremium" label={translate('resources.postcards.fields.isPremiumTemplate')} />
          <BooleanInput source="isActive" label={translate('resources.postcards.fields.isActive')} />
          <NumberInput source="sortOrder" label={translate('resources.postcards.fields.sortOrder')} />
        </Stack>
      </SimpleForm>
    </Edit>
  );
};

export const PostcardTemplateCreate = () => {
  const translate = useTranslate();

  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" fullWidth required label={translate('resources.postcards.fields.name')} />
        <TextInput source="previewUrl" fullWidth label={translate('resources.postcards.fields.previewUrl')} />

        <Box sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>{translate('resources.postcards.sections.styleSettings')}</Box>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <TextInput source="backgroundColor" label={translate('resources.postcards.fields.backgroundColor')} placeholder="#FFFFFF" defaultValue="#FFFFFF" />
          <TextInput source="fontFamily" label={translate('resources.postcards.fields.fontFamily')} placeholder="Merriweather" defaultValue="Merriweather" />
          <TextInput source="fontColor" label={translate('resources.postcards.fields.fontColor')} placeholder="#333333" defaultValue="#333333" />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ width: '100%', mt: 2 }}>
          <BooleanInput source="isPremium" label={translate('resources.postcards.fields.isPremiumTemplate')} defaultValue={false} />
          <BooleanInput source="isActive" label={translate('resources.postcards.fields.isActive')} defaultValue={true} />
          <NumberInput source="sortOrder" label={translate('resources.postcards.fields.sortOrder')} defaultValue={0} />
        </Stack>
      </SimpleForm>
    </Create>
  );
};

// ============================================================
// User Postcards Management
// ============================================================

const ContentTypeField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;

  const colors: Record<string, 'primary' | 'secondary' | 'success'> = {
    QUOTE: 'primary',
    HIGHLIGHT: 'secondary',
    CUSTOM: 'success',
  };

  const contentTypeKey = `resources.postcards.contentType.${record.contentType}`;

  return (
    <Chip
      label={translate(contentTypeKey)}
      color={colors[record.contentType] || 'default'}
      size="small"
    />
  );
};

const PostcardFilters = () => {
  const translate = useTranslate();

  const contentTypes = [
    { id: 'QUOTE', name: translate('resources.postcards.contentType.QUOTE') },
    { id: 'HIGHLIGHT', name: translate('resources.postcards.contentType.HIGHLIGHT') },
    { id: 'CUSTOM', name: translate('resources.postcards.contentType.CUSTOM') },
  ];

  return [
    <SelectInput source="contentType" choices={contentTypes} key="contentType" alwaysOn label={translate('resources.postcards.fields.contentType')} />,
    <BooleanInput source="isPublic" key="isPublic" label={translate('resources.postcards.filters.publicOnly')} />,
  ];
};

const PostcardListActions = () => (
  <TopToolbar>
    <FilterButton />
  </TopToolbar>
);

export const PostcardList = () => {
  const translate = useTranslate();
  const postcardFilters = PostcardFilters();

  return (
    <List
      filters={postcardFilters}
      actions={<PostcardListActions />}
      perPage={25}
      sort={{ field: 'createdAt', order: 'DESC' }}
    >
      <Datagrid rowClick="show">
        <FunctionField
          label={translate('resources.postcards.list.preview')}
          render={(record: { imageUrl?: string; template?: { backgroundColor?: string } }) => (
            <Box
              sx={{
                width: 100,
                height: 60,
                bgcolor: record?.template?.backgroundColor || '#f5f5f5',
                borderRadius: 1,
                backgroundImage: record?.imageUrl ? `url(${record.imageUrl})` : 'none',
                backgroundSize: 'cover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: '#999',
              }}
            >
              {!record?.imageUrl && translate('resources.postcards.list.noImage')}
            </Box>
          )}
        />
        <FunctionField
          label={translate('resources.postcards.fields.content')}
          render={(record: { content?: string }) => (
            <Box sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {record?.content?.substring(0, 80)}...
            </Box>
          )}
        />
        <ContentTypeField label={translate('resources.postcards.fields.contentType')} />
        <TextField source="author" label={translate('resources.postcards.fields.author')} />
        <BooleanField source="isPublic" label={translate('resources.postcards.fields.isPublic')} />
        <NumberField source="shareCount" label={translate('resources.postcards.fields.shareCount')} />
        <TimezoneAwareDateField source="createdAt" label={translate('resources.postcards.fields.createdAt')} />
        <ShowButton />
      </Datagrid>
    </List>
  );
};

const PostcardShowActions = () => {
  const translate = useTranslate();

  return (
    <TopToolbar sx={{ justifyContent: 'flex-start' }}>
      <ListButton label={translate('common.back')} icon={<ArrowBackIcon />} />
    </TopToolbar>
  );
};

export const PostcardShow = () => {
  const translate = useTranslate();

  return (
    <Show actions={<PostcardShowActions />}>
      <SimpleShowLayout>
        <FunctionField
          render={(record: { imageUrl?: string; template?: { backgroundColor?: string; fontFamily?: string; fontColor?: string }; content?: string }) => (
            <Card sx={{ maxWidth: 600, mb: 3 }}>
              {record?.imageUrl ? (
                <CardMedia
                  component="img"
                  image={record.imageUrl}
                  alt="Postcard"
                  sx={{ width: '100%' }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 300,
                    bgcolor: record?.template?.backgroundColor || '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    fontFamily: record?.template?.fontFamily,
                    color: record?.template?.fontColor,
                    fontSize: 18,
                    textAlign: 'center',
                    fontStyle: 'italic',
                  }}
                >
                  "{record?.content}"
                </Box>
              )}
            </Card>
          )}
        />

        <Stack direction="row" spacing={2}>
          <ContentTypeField />
          <BooleanField source="isPublic" label={translate('resources.postcards.fields.isPublic')} />
        </Stack>

        <Box sx={{ mt: 2 }}>
          <Box sx={{ color: 'text.secondary', fontSize: 12 }}>{translate('resources.postcards.fields.content')}</Box>
          <TextField source="content" />
        </Box>

        <FunctionField
          render={(record: { author?: string; bookTitle?: string }) =>
            (record?.author || record?.bookTitle) ? (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ color: 'text.secondary', fontSize: 12 }}>{translate('resources.postcards.show.attribution')}</Box>
                <Box>
                  {record.author && <span>— {record.author}</span>}
                  {record.bookTitle && <span>, {record.bookTitle}</span>}
                </Box>
              </Box>
            ) : null
          }
        />

        <Box sx={{ mt: 2 }}>
          <Box sx={{ color: 'text.secondary', fontSize: 12 }}>{translate('resources.postcards.fields.template')}</Box>
          <FunctionField
            render={(record: { template?: { name?: string } }) => record?.template?.name || translate('resources.postcards.show.unknown')}
          />
        </Box>

        <Stack direction="row" spacing={4} sx={{ mt: 3 }}>
          <Box>
            <Box sx={{ color: 'text.secondary', fontSize: 12 }}>{translate('resources.postcards.fields.shareCount')}</Box>
            <NumberField source="shareCount" />
          </Box>
          <Box>
            <Box sx={{ color: 'text.secondary', fontSize: 12 }}>{translate('resources.postcards.fields.userId')}</Box>
            <TextField source="userId" />
          </Box>
        </Stack>

        <TimezoneAwareDateField source="createdAt" showTime label={translate('resources.postcards.fields.createdAt')} />
        <TimezoneAwareDateField source="updatedAt" showTime label={translate('resources.postcards.fields.updatedAt')} />
      </SimpleShowLayout>
    </Show>
  );
};
