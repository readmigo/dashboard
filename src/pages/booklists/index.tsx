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
  NumberInput,
  SelectInput,
  Show,
  SimpleShowLayout,
  RichTextField,
  useRecordContext,
  TopToolbar,
  Button,
  useNotify,
  useRefresh,
  FilterButton,
  CreateButton,
  FunctionField,
  BooleanField,
  BooleanInput,
  ListButton,
  useTranslate,
} from 'react-admin';
import { TimezoneAwareDateField } from '../../components/TimezoneAwareDateField';
import { Chip, Box, Stack, Avatar, AvatarGroup } from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Helper function to get translated choices
const useBooklistChoices = () => {
  const translate = useTranslate();

  const BOOKLIST_TYPES = [
    { id: 'EDITORS_PICK', name: translate('resources.booklists.types.editorsPick') },
    { id: 'ANNUAL_BEST', name: translate('resources.booklists.types.annualBest') },
    { id: 'UNIVERSITY', name: translate('resources.booklists.types.university') },
    { id: 'CELEBRITY', name: translate('resources.booklists.types.celebrity') },
    { id: 'RANKING', name: translate('resources.booklists.types.ranking') },
    { id: 'COLLECTION', name: translate('resources.booklists.types.collection') },
    { id: 'AI_RECOMMENDED', name: translate('resources.booklists.types.aiRecommended') },
    { id: 'PERSONALIZED', name: translate('resources.booklists.types.personalized') },
    { id: 'AI_FEATURED', name: translate('resources.booklists.types.aiFeatured') },
  ];

  const BOOKLIST_STATUSES = [
    { id: 'ACTIVE', name: translate('resources.booklists.status.active') },
    { id: 'INACTIVE', name: translate('resources.booklists.status.inactive') },
    { id: 'SCHEDULED', name: translate('resources.booklists.status.scheduled') },
  ];

  const DISPLAY_STYLES = [
    { id: 'CAROUSEL', name: translate('resources.booklists.displayStyles.carousel') },
    { id: 'HORIZONTAL', name: translate('resources.booklists.displayStyles.horizontal') },
    { id: 'VERTICAL', name: translate('resources.booklists.displayStyles.vertical') },
    { id: 'GRID', name: translate('resources.booklists.displayStyles.grid') },
  ];

  const UPDATE_FREQUENCIES = [
    { id: 'DAILY', name: translate('resources.booklists.updateFrequencies.daily') },
    { id: 'WEEKLY', name: translate('resources.booklists.updateFrequencies.weekly') },
    { id: 'MONTHLY', name: translate('resources.booklists.updateFrequencies.monthly') },
  ];

  const RANKING_CRITERIA = [
    { id: 'READERS', name: translate('resources.booklists.rankingCriteria.readersCount') },
    { id: 'COMPLETION', name: translate('resources.booklists.rankingCriteria.completionRate') },
    { id: 'RATING', name: translate('resources.booklists.rankingCriteria.rating') },
    { id: 'NEWEST', name: translate('resources.booklists.rankingCriteria.newest') },
  ];

  const TARGET_LEVELS = [
    { id: 'BEGINNER', name: translate('resources.booklists.targetLevels.beginner') },
    { id: 'INTERMEDIATE', name: translate('resources.booklists.targetLevels.intermediate') },
    { id: 'ADVANCED', name: translate('resources.booklists.targetLevels.advanced') },
    { id: 'ALL', name: translate('resources.booklists.targetLevels.all') },
  ];

  const TARGET_FEATURES = [
    { id: 'VOCABULARY', name: translate('resources.booklists.targetFeatures.vocabulary') },
    { id: 'SPEAKING', name: translate('resources.booklists.targetFeatures.speaking') },
    { id: 'WRITING', name: translate('resources.booklists.targetFeatures.writing') },
    { id: 'READING', name: translate('resources.booklists.targetFeatures.reading') },
    { id: 'LISTENING', name: translate('resources.booklists.targetFeatures.listening') },
    { id: 'ALL', name: translate('resources.booklists.targetFeatures.all') },
  ];

  return {
    BOOKLIST_TYPES,
    BOOKLIST_STATUSES,
    DISPLAY_STYLES,
    UPDATE_FREQUENCIES,
    RANKING_CRITERIA,
    TARGET_LEVELS,
    TARGET_FEATURES,
  };
};

// Filter component that uses translated choices
const BooklistFilters = () => {
  const { BOOKLIST_TYPES, BOOKLIST_STATUSES } = useBooklistChoices();
  return [
    <SelectInput source="type" choices={BOOKLIST_TYPES} key="type" alwaysOn />,
    <SelectInput source="status" choices={BOOKLIST_STATUSES} key="status" />,
  ];
};

const TypeField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;

  const colors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    EDITORS_PICK: 'primary',
    ANNUAL_BEST: 'secondary',
    UNIVERSITY: 'info',
    CELEBRITY: 'warning',
    RANKING: 'success',
    COLLECTION: 'default',
    AI_RECOMMENDED: 'error',
    PERSONALIZED: 'error',
    AI_FEATURED: 'error',
  };

  const typeKeys: Record<string, string> = {
    EDITORS_PICK: 'editorsPick',
    ANNUAL_BEST: 'annualBest',
    UNIVERSITY: 'university',
    CELEBRITY: 'celebrity',
    RANKING: 'ranking',
    COLLECTION: 'collection',
    AI_RECOMMENDED: 'aiRecommended',
    PERSONALIZED: 'personalized',
    AI_FEATURED: 'aiFeatured',
  };

  const label = typeKeys[record.type]
    ? translate(`resources.booklists.types.${typeKeys[record.type]}`)
    : record.type;

  return (
    <Chip
      label={label}
      color={colors[record.type] || 'default'}
      size="small"
    />
  );
};

const StatusField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;

  const colors: Record<string, 'default' | 'success' | 'warning'> = {
    ACTIVE: 'success',
    INACTIVE: 'default',
    SCHEDULED: 'warning',
  };

  const statusKeys: Record<string, string> = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SCHEDULED: 'scheduled',
  };

  const label = statusKeys[record.status]
    ? translate(`resources.booklists.status.${statusKeys[record.status]}`)
    : record.status;

  return (
    <Chip
      label={label}
      color={colors[record.status] || 'default'}
      size="small"
      variant="outlined"
    />
  );
};

const PreviewCoversField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record || !record.previewCovers || record.previewCovers.length === 0) {
    return <Box sx={{ width: 80, height: 40, bgcolor: '#eee', borderRadius: 1 }} />;
  }

  return (
    <AvatarGroup max={3} sx={{ justifyContent: 'flex-start' }}>
      {record.previewCovers.map((url: string, index: number) => (
        <Avatar
          key={index}
          src={url}
          variant="rounded"
          sx={{ width: 30, height: 45 }}
        />
      ))}
    </AvatarGroup>
  );
};

const PublishButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const translate = useTranslate();

  if (!record || record.status === 'ACTIVE') return null;

  const handlePublish = async () => {
    try {
      const response = await fetch(`/api/v1/admin/booklists/${record.id}/publish`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to publish');
      notify(translate('resources.booklists.notifications.published'));
      refresh();
    } catch {
      notify(translate('resources.booklists.notifications.publishError'), { type: 'error' });
    }
  };

  return (
    <Button label={translate('resources.booklists.actions.publish')} onClick={handlePublish} color="primary">
      <PublishIcon />
    </Button>
  );
};

const UnpublishButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const translate = useTranslate();

  if (!record || record.status !== 'ACTIVE') return null;

  const handleUnpublish = async () => {
    try {
      const response = await fetch(`/api/v1/admin/booklists/${record.id}/unpublish`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to unpublish');
      notify(translate('resources.booklists.notifications.unpublished'));
      refresh();
    } catch {
      notify(translate('resources.booklists.notifications.unpublishError'), { type: 'error' });
    }
  };

  return (
    <Button label={translate('resources.booklists.actions.unpublish')} onClick={handleUnpublish} color="warning">
      <UnpublishedIcon />
    </Button>
  );
};

const DuplicateButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const translate = useTranslate();

  if (!record) return null;

  const handleDuplicate = async () => {
    try {
      const response = await fetch(`/api/v1/admin/booklists/${record.id}/duplicate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to duplicate');
      notify(translate('resources.booklists.notifications.duplicated'));
      refresh();
    } catch {
      notify(translate('resources.booklists.notifications.duplicateError'), { type: 'error' });
    }
  };

  return (
    <Button label={translate('resources.booklists.actions.duplicate')} onClick={handleDuplicate}>
      <ContentCopyIcon />
    </Button>
  );
};

const ListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
  </TopToolbar>
);

export const BookListList = () => {
  const translate = useTranslate();
  const filters = BooklistFilters();

  return (
    <List
      filters={filters}
      actions={<ListActions />}
      perPage={25}
      sort={{ field: 'sortOrder', order: 'ASC' }}
    >
      <Datagrid rowClick="show">
        <PreviewCoversField label={translate('resources.booklists.list.preview')} />
        <TextField source="name" label={translate('resources.booklists.fields.name')} />
        <TypeField label={translate('resources.booklists.fields.type')} />
        <FunctionField
          label={translate('resources.booklists.list.books')}
          render={(record: { itemCount?: number }) => record?.itemCount || 0}
        />
        <StatusField label={translate('resources.booklists.fields.status')} />
        <BooleanField source="isAiGenerated" label={translate('resources.booklists.list.ai')} />
        <TimezoneAwareDateField source="updatedAt" label={translate('resources.booklists.list.updated')} />
        <EditButton />
        <ShowButton />
      </Datagrid>
    </List>
  );
};

export const BookListEdit = () => {
  const translate = useTranslate();
  const {
    BOOKLIST_TYPES,
    BOOKLIST_STATUSES,
    DISPLAY_STYLES,
    UPDATE_FREQUENCIES,
    RANKING_CRITERIA,
    TARGET_LEVELS,
    TARGET_FEATURES,
  } = useBooklistChoices();

  return (
    <Edit>
      <SimpleForm>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <TextInput source="name" fullWidth required label={translate('resources.booklists.fields.name')} />
          <TextInput source="nameEn" fullWidth label={translate('resources.booklists.fields.nameEn')} />
        </Stack>
        <TextInput source="subtitle" fullWidth label={translate('resources.booklists.fields.subtitle')} />
        <TextInput source="description" multiline rows={3} fullWidth label={translate('resources.booklists.fields.description')} />
        <TextInput source="coverUrl" fullWidth label={translate('resources.booklists.fields.coverUrl')} />

        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <SelectInput source="type" choices={BOOKLIST_TYPES} required label={translate('resources.booklists.fields.type')} />
          <SelectInput source="status" choices={BOOKLIST_STATUSES} label={translate('resources.booklists.fields.status')} />
          <NumberInput source="sortOrder" label={translate('resources.booklists.fields.sortOrder')} />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <SelectInput source="displayStyle" choices={DISPLAY_STYLES} label={translate('resources.booklists.fields.displayStyle')} />
          <NumberInput source="maxDisplayCount" label={translate('resources.booklists.fields.maxDisplay')} />
          <BooleanInput source="showRank" label={translate('resources.booklists.fields.showRank')} />
          <BooleanInput source="showDescription" label={translate('resources.booklists.fields.showDescription')} />
        </Stack>

        <Box sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>{translate('resources.booklists.sections.autoUpdateSettings')}</Box>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <BooleanInput source="autoUpdate" label={translate('resources.booklists.fields.autoUpdate')} />
          <SelectInput source="updateFrequency" choices={UPDATE_FREQUENCIES} label={translate('resources.booklists.fields.updateFrequency')} />
          <SelectInput source="rankingCriteria" choices={RANKING_CRITERIA} label={translate('resources.booklists.fields.rankingCriteria')} />
        </Stack>

        <Box sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>{translate('resources.booklists.sections.aiSettings')}</Box>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <BooleanInput source="isAiGenerated" label={translate('resources.booklists.fields.aiGenerated')} />
          <SelectInput source="targetLevel" choices={TARGET_LEVELS} label={translate('resources.booklists.fields.targetLevel')} />
          <SelectInput source="targetFeature" choices={TARGET_FEATURES} label={translate('resources.booklists.fields.targetFeature')} />
        </Stack>
        <TextInput source="aiPrompt" multiline rows={2} fullWidth label={translate('resources.booklists.fields.aiPrompt')} />
        <TextInput source="aiModel" fullWidth label={translate('resources.booklists.fields.aiModel')} />
      </SimpleForm>
    </Edit>
  );
};

export const BookListCreate = () => {
  const translate = useTranslate();
  const { BOOKLIST_TYPES, DISPLAY_STYLES } = useBooklistChoices();

  return (
    <Create>
      <SimpleForm>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <TextInput source="name" fullWidth required label={translate('resources.booklists.fields.name')} />
          <TextInput source="nameEn" fullWidth label={translate('resources.booklists.fields.nameEn')} />
        </Stack>
        <TextInput source="subtitle" fullWidth label={translate('resources.booklists.fields.subtitle')} />
        <TextInput source="description" multiline rows={3} fullWidth label={translate('resources.booklists.fields.description')} />

        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <SelectInput source="type" choices={BOOKLIST_TYPES} required defaultValue="EDITORS_PICK" label={translate('resources.booklists.fields.type')} />
          <SelectInput source="displayStyle" choices={DISPLAY_STYLES} defaultValue="HORIZONTAL" label={translate('resources.booklists.fields.displayStyle')} />
          <NumberInput source="sortOrder" label={translate('resources.booklists.fields.sortOrder')} defaultValue={0} />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <BooleanInput source="showRank" label={translate('resources.booklists.fields.showRank')} />
          <BooleanInput source="showDescription" label={translate('resources.booklists.fields.showDescription')} defaultValue={true} />
          <BooleanInput source="isAiGenerated" label={translate('resources.booklists.fields.aiGenerated')} />
        </Stack>
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

const BookListShowContent = () => {
  const translate = useTranslate();

  return (
    <SimpleShowLayout>
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <Box>
          <Box component="h1" sx={{ fontSize: 24, fontWeight: 700, m: 0 }}>
            <TextField source="name" />
          </Box>
          <Box sx={{ color: 'text.secondary', mt: 1 }}>
            <TextField source="subtitle" />
          </Box>
        </Box>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TypeField />
        <StatusField />
        <BooleanField source="isAiGenerated" label={translate('resources.booklists.fields.aiGenerated')} />
      </Stack>

      <RichTextField source="description" label={translate('resources.booklists.fields.description')} />

      <Box sx={{ mt: 2, fontWeight: 'bold' }}>{translate('resources.booklists.sections.displaySettings')}</Box>
      <Stack direction="row" spacing={4}>
        <Box>
          <Box sx={{ color: 'text.secondary', fontSize: 12 }}>{translate('resources.booklists.fields.displayStyle')}</Box>
          <TextField source="displayStyle" />
        </Box>
        <Box>
          <Box sx={{ color: 'text.secondary', fontSize: 12 }}>{translate('resources.booklists.fields.maxDisplay')}</Box>
          <TextField source="maxDisplayCount" />
        </Box>
        <Box>
          <Box sx={{ color: 'text.secondary', fontSize: 12 }}>{translate('resources.booklists.fields.showRank')}</Box>
          <BooleanField source="showRank" />
        </Box>
      </Stack>

      <Box sx={{ mt: 2, fontWeight: 'bold' }}>{translate('resources.booklists.sections.booksInList')}</Box>
      <FunctionField
        render={(record: { items?: Array<{ book: { title: string; author: string; coverThumbUrl?: string } }> }) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            {record?.items?.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center', p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                {item.book.coverThumbUrl && (
                  <img src={item.book.coverThumbUrl} alt="" style={{ width: 30, height: 45, objectFit: 'cover' }} />
                )}
                <Box>
                  <Box sx={{ fontSize: 14, fontWeight: 500 }}>{item.book.title}</Box>
                  <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{item.book.author}</Box>
                </Box>
              </Box>
            )) || <span>{translate('resources.booklists.show.noBooksYet')}</span>}
          </Box>
        )}
      />

      <TimezoneAwareDateField source="createdAt" showTime label={translate('resources.booklists.list.created')} />
      <TimezoneAwareDateField source="updatedAt" showTime label={translate('resources.booklists.list.updated')} />

      <Box mt={2} display="flex" gap={1}>
        <PublishButton />
        <UnpublishButton />
        <DuplicateButton />
      </Box>
    </SimpleShowLayout>
  );
};

export const BookListShow = () => (
  <Show actions={<ShowActions />}>
    <BookListShowContent />
  </Show>
);
