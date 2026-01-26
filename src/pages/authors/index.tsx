import {
  List,
  Datagrid,
  TextField,
  NumberField,
  EditButton,
  ShowButton,
  Edit,
  Show,
  SimpleForm,
  TextInput,
  BooleanInput,
  SimpleShowLayout,
  useRecordContext,
  TopToolbar,
  FilterButton,
  SearchInput,
  ExportButton,
  BooleanField,
  ReferenceManyField,
  FunctionField,
  ListButton,
  useTranslate,
} from 'react-admin';
import { TimezoneAwareDateField } from '../../components/TimezoneAwareDateField';
import { Chip, Box, Avatar, Stack, Typography, Card, CardContent, Divider, Link } from '@mui/material';
import { useContentLanguage } from '../../contexts/ContentLanguageContext';
import PublicIcon from '@mui/icons-material/Public';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import PeopleIcon from '@mui/icons-material/People';
import LinkIcon from '@mui/icons-material/Link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Avatar field component
const AuthorAvatarField = ({ size = 40 }: { size?: number; label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Avatar
      src={record.avatarUrl}
      alt={record.name}
      sx={{ width: size, height: size }}
    >
      {record.name?.charAt(0) || '?'}
    </Avatar>
  );
};

// Status chip field
const StatusField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;

  return (
    <Chip
      label={record.isActive ? translate('resources.authors.status.active') : translate('resources.authors.status.inactive')}
      color={record.isActive ? 'success' : 'default'}
      size="small"
    />
  );
};

// Data completeness indicator
const CompletenessField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;

  const fields = [
    record.avatarUrl,
    record.bio,
    record.bioZh,
    record.nationality,
    record.birthPlace,
    record.writingStyle,
    record.aiPersonaPrompt,
  ];

  const filled = fields.filter(Boolean).length;
  const total = fields.length;
  const percentage = Math.round((filled / total) * 100);

  const color = percentage >= 80 ? 'success' : percentage >= 50 ? 'warning' : 'error';

  return (
    <Chip
      label={`${percentage}%`}
      color={color}
      size="small"
      variant="outlined"
    />
  );
};

// Filters for the list - labels handled by react-admin via resources.authors.fields
const authorFilters = [
  <SearchInput source="search" alwaysOn key="search" />,
  <TextInput source="nationality" key="nationality" />,
  <TextInput source="literaryPeriod" key="literaryPeriod" />,
];

// List actions toolbar
const ListActions = () => (
  <TopToolbar>
    <FilterButton />
    <ExportButton />
  </TopToolbar>
);

// Author List component
export const AuthorList = () => {
  const { contentLanguage } = useContentLanguage();
  const translate = useTranslate();

  return (
    <List
      key={contentLanguage}
      filters={authorFilters}
      actions={<ListActions />}
      perPage={25}
      sort={{ field: 'bookCount', order: 'DESC' }}
    >
      <Datagrid rowClick="show">
        <AuthorAvatarField label={translate('resources.authors.list.avatar')} />
        <TextField source="name" />
        <TextField source="nameZh" />
        <TextField source="era" />
        <TextField source="nationality" />
        <TextField source="literaryPeriod" label={translate('resources.authors.list.period')} />
        <NumberField source="bookCount" label={translate('resources.authors.list.books')} />
        <NumberField source="quoteCount" label={translate('resources.authors.list.quotes')} />
        <CompletenessField label={translate('resources.authors.list.complete')} />
        <StatusField label={translate('resources.authors.list.status')} />
        <EditButton />
        <ShowButton />
      </Datagrid>
    </List>
  );
};

// Author Edit component
export const AuthorEdit = () => {
  const translate = useTranslate();

  return (
    <Edit>
      <SimpleForm>
        <Typography variant="h6" gutterBottom>{translate('resources.authors.sections.basicInfo')}</Typography>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <TextInput source="name" fullWidth required />
          <TextInput source="nameZh" fullWidth />
        </Stack>
        <TextInput source="avatarUrl" fullWidth />
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <TextInput source="era" label={translate('resources.authors.form.eraPlaceholder')} />
          <TextInput source="nationality" />
          <TextInput source="birthPlace" />
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>{translate('resources.authors.sections.biography')}</Typography>
        <TextInput source="bio" multiline rows={4} fullWidth label={translate('resources.authors.form.englishBio')} />
        <TextInput source="bioZh" multiline rows={4} fullWidth label={translate('resources.authors.form.chineseBio')} />

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>{translate('resources.authors.sections.writingStyle')}</Typography>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <TextInput source="literaryPeriod" />
          <TextInput source="voiceStyle" />
        </Stack>
        <TextInput source="writingStyle" multiline rows={3} fullWidth label={translate('resources.authors.form.writingStyleDesc')} />

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>{translate('resources.authors.sections.aiPersona')}</Typography>
        <TextInput source="aiPersonaPrompt" multiline rows={6} fullWidth />

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>{translate('resources.authors.sections.externalLinks')}</Typography>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <TextInput source="wikipediaUrl" fullWidth />
          <TextInput source="wikidataId" />
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>{translate('resources.authors.sections.status')}</Typography>
        <BooleanInput source="isActive" />
      </SimpleForm>
    </Edit>
  );
};

// Show page components
const ShowAvatarField = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Avatar
      src={record.avatarUrl}
      alt={record.name}
      sx={{ width: 120, height: 120, fontSize: 48 }}
    >
      {record.name?.charAt(0) || '?'}
    </Avatar>
  );
};

const AuthorHeader = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;

  return (
    <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
      <ShowAvatarField />
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" gutterBottom>
          {record.name}
          {record.nameZh && (
            <Typography component="span" variant="h5" color="text.secondary" sx={{ ml: 2 }}>
              {record.nameZh}
            </Typography>
          )}
        </Typography>

        <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 1 }}>
          {record.era && (
            <Chip icon={<CalendarTodayIcon />} label={record.era} size="small" variant="outlined" />
          )}
          {record.nationality && (
            <Chip icon={<PublicIcon />} label={record.nationality} size="small" variant="outlined" />
          )}
          {record.birthPlace && (
            <Chip icon={<PlaceIcon />} label={record.birthPlace} size="small" variant="outlined" />
          )}
          {record.literaryPeriod && (
            <Chip label={record.literaryPeriod} size="small" color="primary" variant="outlined" />
          )}
        </Stack>

        <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MenuBookIcon fontSize="small" color="action" />
            <Typography variant="body2">{record.bookCount || 0} {translate('resources.authors.show.books')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FormatQuoteIcon fontSize="small" color="action" />
            <Typography variant="body2">{record.quoteCount || 0} {translate('resources.authors.show.quotes')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PeopleIcon fontSize="small" color="action" />
            <Typography variant="body2">{record.followerCount || 0} {translate('resources.authors.show.followers')}</Typography>
          </Box>
        </Stack>

        {record.wikipediaUrl && (
          <Box sx={{ mt: 1 }}>
            <Link href={record.wikipediaUrl} target="_blank" rel="noopener" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LinkIcon fontSize="small" />
              {translate('resources.authors.show.wikipedia')}
            </Link>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const BioSection = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{translate('resources.authors.sections.biography')}</Typography>
        {record.bio && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">{translate('resources.authors.show.english')}</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{record.bio}</Typography>
          </Box>
        )}
        {record.bioZh && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary">{translate('resources.authors.show.chinese')}</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{record.bioZh}</Typography>
          </Box>
        )}
        {!record.bio && !record.bioZh && (
          <Typography color="text.secondary">{translate('resources.authors.show.noBio')}</Typography>
        )}
      </CardContent>
    </Card>
  );
};

const WritingStyleSection = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{translate('resources.authors.sections.writingStyle')}</Typography>
        {record.writingStyle ? (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{record.writingStyle}</Typography>
        ) : (
          <Typography color="text.secondary">{translate('resources.authors.show.noWritingStyle')}</Typography>
        )}
        {record.famousWorks && record.famousWorks.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>{translate('resources.authors.show.famousWorks')}</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {record.famousWorks.map((work: string, index: number) => (
                <Chip key={index} label={work} size="small" />
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const AIPersonaSection = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{translate('resources.authors.fields.aiPersonaPrompt')}</Typography>
        {record.aiPersonaPrompt ? (
          <Box
            sx={{
              backgroundColor: 'grey.100',
              p: 2,
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap',
              maxHeight: 300,
              overflow: 'auto',
            }}
          >
            {record.aiPersonaPrompt}
          </Box>
        ) : (
          <Typography color="text.secondary">{translate('resources.authors.show.noAiPersona')}</Typography>
        )}
        {record.voiceStyle && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">{translate('resources.authors.fields.voiceStyle')}</Typography>
            <Chip label={record.voiceStyle} size="small" color="secondary" />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const ShowActions = () => {
  const translate = useTranslate();
  return (
    <TopToolbar sx={{ justifyContent: 'space-between', width: '100%' }}>
      <ListButton label={translate('resources.authors.show.back')} icon={<ArrowBackIcon />} />
      <EditButton />
    </TopToolbar>
  );
};

// Timeline Events Card component
const TimelineEventsCard = () => {
  const translate = useTranslate();
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{translate('resources.authors.sections.timelineEvents')}</Typography>
        <ReferenceManyField
          reference="author-timeline-events"
          target="authorId"
          sort={{ field: 'year', order: 'ASC' }}
        >
          <Datagrid bulkActionButtons={false}>
            <NumberField source="year" />
            <TextField source="title" />
            <TextField source="titleZh" />
            <TextField source="category" />
          </Datagrid>
        </ReferenceManyField>
      </CardContent>
    </Card>
  );
};

// Quotes Card component
const QuotesCard = () => {
  const translate = useTranslate();
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{translate('resources.authors.sections.quotes')}</Typography>
        <ReferenceManyField
          reference="author-quotes"
          target="authorId"
          perPage={10}
        >
          <Datagrid bulkActionButtons={false}>
            <FunctionField
              source="text"
              render={(record: { text: string }) =>
                record?.text?.length > 100 ? record.text.substring(0, 100) + '...' : record?.text
              }
            />
            <TextField source="source" />
          </Datagrid>
        </ReferenceManyField>
      </CardContent>
    </Card>
  );
};

// Metadata Card component
const MetadataCard = () => {
  const translate = useTranslate();
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>{translate('resources.authors.sections.metadata')}</Typography>
        <Stack direction="row" spacing={4}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">{translate('resources.authors.sections.status')}</Typography>
            <BooleanField source="isActive" />
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">{translate('resources.authors.fields.wikidataId')}</Typography>
            <TextField source="wikidataId" emptyText="-" />
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">{translate('resources.authors.fields.createdAt')}</Typography>
            <TimezoneAwareDateField source="createdAt" showTime />
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">{translate('resources.authors.fields.updatedAt')}</Typography>
            <TimezoneAwareDateField source="updatedAt" showTime />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Author Show component
export const AuthorShow = () => (
  <Show actions={<ShowActions />}>
    <SimpleShowLayout>
      <AuthorHeader />
      <BioSection />
      <WritingStyleSection />
      <AIPersonaSection />
      <TimelineEventsCard />
      <QuotesCard />
      <MetadataCard />
    </SimpleShowLayout>
  </Show>
);
