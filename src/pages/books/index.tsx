import {
  List,
  Datagrid,
  TextField,
  NumberField,
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
  SearchInput,
  FunctionField,
  CreateButton,
  ExportButton,
  BulkDeleteButton,
  BulkUpdateButton,
  ListButton,
  useTranslate,
} from 'react-admin';
import { TimezoneAwareDateField } from '../../components/TimezoneAwareDateField';
import { Chip, Box, LinearProgress, Stack, Alert } from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { useContentLanguage } from '../../contexts/ContentLanguageContext';
import { getStoredEnvironment } from '../../contexts/EnvironmentContext';
import { getApiUrl } from '../../config/environments';

// Book status enum matching Prisma schema
const BOOK_STATUSES = [
  { id: 'PENDING', name: 'Pending' },
  { id: 'PROCESSING', name: 'Processing' },
  { id: 'ACTIVE', name: 'Active' },
  { id: 'INACTIVE', name: 'Inactive' },
  { id: 'ERROR', name: 'Error' },
];

// Book source enum matching Prisma schema
const BOOK_SOURCES = [
  { id: 'STANDARD_EBOOKS', name: 'Standard Ebooks' },
  { id: 'GUTENBERG', name: 'Project Gutenberg' },
  { id: 'INTERNET_ARCHIVE', name: 'Internet Archive' },
  { id: 'USER_UPLOAD', name: 'User Upload' },
  // Chinese sources
  { id: 'CTEXT', name: '中国哲学书电子化' },
  { id: 'WIKISOURCE_ZH', name: '维基文库中文' },
  { id: 'GUTENBERG_ZH', name: 'Gutenberg 中文' },
  { id: 'SHUGE', name: '书格' },
];

// Language options
const LANGUAGES = [
  { id: 'en', name: 'English' },
  { id: 'zh', name: '中文' },
];

const bookFilters = [
  <SearchInput source="search" alwaysOn key="search" />,
  <SelectInput source="status" choices={BOOK_STATUSES} key="status" />,
  <SelectInput source="source" choices={BOOK_SOURCES} key="source" />,
  <NumberInput source="minDifficulty" label="Min Difficulty" key="minDiff" />,
  <NumberInput source="maxDifficulty" label="Max Difficulty" key="maxDiff" />,
];

const StatusField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;

  const colors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
    PENDING: 'warning',
    PROCESSING: 'primary',
    ACTIVE: 'success',
    INACTIVE: 'default',
    ERROR: 'error',
  };

  return (
    <Chip
      label={record.status}
      color={colors[record.status] || 'default'}
      size="small"
    />
  );
};

// Content Review Status field
const ContentReviewStatusField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record || !record.contentReviewStatus) return <span>-</span>;

  const statusConfig: Record<string, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' }> = {
    PENDING_REVIEW: { label: '待审核', color: 'warning' },
    IN_REVIEW: { label: '审核中', color: 'primary' },
    APPROVED: { label: '已通过', color: 'success' },
    REJECTED: { label: '已拒绝', color: 'error' },
    PUBLISHED: { label: '已发布', color: 'success' },
  };

  const config = statusConfig[record.contentReviewStatus] || { label: record.contentReviewStatus, color: 'default' };

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      variant="outlined"
    />
  );
};

// Review in Content Studio button
const ReviewInStudioButton = () => {
  const record = useRecordContext();
  const translate = useTranslate();

  if (!record) return null;

  // Only show for books that need review
  const reviewableStatuses = ['PENDING_REVIEW', 'IN_REVIEW', 'REJECTED'];
  if (!record.contentReviewStatus || !reviewableStatuses.includes(record.contentReviewStatus)) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Open Content Studio in new tab with book ID
    const studioUrl = `http://localhost:3002/books/${record.id}`;
    window.open(studioUrl, '_blank');
  };

  return (
    <Button
      label={translate('resources.books.actions.review', { _: '审核' })}
      onClick={handleClick}
      color="primary"
    >
      <RateReviewIcon />
    </Button>
  );
};

const SourceField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;

  const labels: Record<string, string> = {
    STANDARD_EBOOKS: 'Standard Ebooks',
    GUTENBERG: 'Gutenberg',
    INTERNET_ARCHIVE: 'Internet Archive',
    USER_UPLOAD: 'Upload',
    CTEXT: '中哲书',
    WIKISOURCE_ZH: '维基文库',
    GUTENBERG_ZH: 'Gutenberg中文',
    SHUGE: '书格',
  };

  return (
    <Chip
      label={labels[record.source] || record.source}
      size="small"
      variant="outlined"
    />
  );
};

const DifficultyField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return <span>-</span>;

  // For Chinese books, show HSK level
  if (record.language === 'zh' && record.hskLevel) {
    const hskColors: Record<number, string> = {
      1: '#4caf50', 2: '#8bc34a', 3: '#cddc39',
      4: '#ffeb3b', 5: '#ff9800', 6: '#f44336',
      7: '#e91e63', 8: '#9c27b0', 9: '#673ab7',
    };
    return (
      <Chip
        label={`HSK ${record.hskLevel}`}
        size="small"
        sx={{ backgroundColor: hskColors[record.hskLevel] || '#9e9e9e', color: 'white' }}
      />
    );
  }

  // For English books, show CEFR level if available
  if (record.language === 'en' && record.cefrLevel) {
    const cefrColors: Record<string, string> = {
      'A1': '#4caf50', 'A2': '#8bc34a',
      'B1': '#ffeb3b', 'B2': '#ff9800',
      'C1': '#f44336', 'C2': '#9c27b0',
    };
    return (
      <Chip
        label={record.cefrLevel}
        size="small"
        sx={{ backgroundColor: cefrColors[record.cefrLevel] || '#9e9e9e', color: 'white' }}
      />
    );
  }

  // Fallback to difficulty score
  if (record.difficultyScore == null) return <span>-</span>;

  const score = record.difficultyScore;
  const color = score <= 30 ? '#4caf50' : score <= 60 ? '#ff9800' : '#f44336';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 100 }}>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          flex: 1,
          height: 8,
          borderRadius: 4,
          '& .MuiLinearProgress-bar': { backgroundColor: color },
        }}
      />
      <span style={{ fontSize: 12, minWidth: 24 }}>{score}</span>
    </Box>
  );
};

const LanguageField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;

  const langLabels: Record<string, { emoji: string; name: string }> = {
    en: { emoji: '🇬🇧', name: 'English' },
    zh: { emoji: '🇨🇳', name: '中文' },
    ja: { emoji: '🇯🇵', name: '日本語' },
    ko: { emoji: '🇰🇷', name: '한국어' },
  };

  const lang = langLabels[record.language] || { emoji: '🌐', name: record.language };

  return (
    <Chip
      label={`${lang.emoji} ${lang.name}`}
      size="small"
      variant="outlined"
    />
  );
};

// Transform R2 URL to proxy URL or use directly
const getProxyUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  // For R2 URLs, use them directly (they're publicly accessible)
  // URL format: https://<account>.r2.cloudflarestorage.com/readmigo/covers/...
  return url;
};

const CoverField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;

  const url = getProxyUrl(record.coverThumbUrl) || getProxyUrl(record.coverUrl);
  if (!url) return <Box sx={{ width: 40, height: 60, bgcolor: '#eee', borderRadius: 1 }} />;

  return (
    <img
      src={url}
      alt={record.title}
      style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 4 }}
    />
  );
};

const WordCountField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record || !record.wordCount) return <span>-</span>;

  const count = record.wordCount;
  if (count >= 1000000) return <span>{(count / 1000000).toFixed(1)}M</span>;
  if (count >= 1000) return <span>{(count / 1000).toFixed(1)}K</span>;
  return <span>{count}</span>;
};

// Helper to get API base URL
const getApiBaseUrl = () => {
  const env = getStoredEnvironment();
  return `${getApiUrl(env)}/api/v1/admin`;
};

const PublishButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const translate = useTranslate();
  const { contentLanguage } = useContentLanguage();

  if (!record || record.status === 'ACTIVE') return null;

  const handlePublish = async () => {
    try {
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/books/${record.id}/publish`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          'X-Admin-Mode': 'true',
          'X-Content-Filter': contentLanguage,
        },
      });
      if (!response.ok) throw new Error('Failed to publish');
      notify(translate('resources.books.notifications.published'));
      refresh();
    } catch {
      notify(translate('resources.books.notifications.publishError'), { type: 'error' });
    }
  };

  return (
    <Button label={translate('resources.books.actions.publish')} onClick={handlePublish} color="primary">
      <PublishIcon />
    </Button>
  );
};

const UnpublishButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const translate = useTranslate();
  const { contentLanguage } = useContentLanguage();

  if (!record || record.status !== 'ACTIVE') return null;

  const handleUnpublish = async () => {
    try {
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/books/${record.id}/unpublish`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          'X-Admin-Mode': 'true',
          'X-Content-Filter': contentLanguage,
        },
      });
      if (!response.ok) throw new Error('Failed to unpublish');
      notify(translate('resources.books.notifications.unpublished'));
      refresh();
    } catch {
      notify(translate('resources.books.notifications.unpublishError'), { type: 'error' });
    }
  };

  return (
    <Button label={translate('resources.books.actions.unpublish')} onClick={handleUnpublish} color="warning">
      <UnpublishedIcon />
    </Button>
  );
};

const ContentModeIndicator = () => {
  const { contentLanguage } = useContentLanguage();
  const translate = useTranslate();

  if (contentLanguage === 'all') return null;

  const label = contentLanguage === 'en' ? 'English' : '中文';
  const color = contentLanguage === 'en' ? 'primary' : 'error';

  return (
    <Alert
      severity="info"
      sx={{ mb: 2 }}
      icon={<PublishIcon />}
    >
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
        <strong>{translate('resources.books.editMode.title')}</strong>: {translate('resources.books.editMode.showing')}{' '}
        <Chip label={label} size="small" color={color} />{' '}
        {translate('resources.books.editMode.content')}
      </Box>
    </Alert>
  );
};

const ListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

const BulkActionButtons = () => {
  const translate = useTranslate();
  return (
    <>
      <BulkUpdateButton data={{ status: 'ACTIVE' }} label={translate('resources.books.actions.publishSelected')} />
      <BulkUpdateButton data={{ status: 'INACTIVE' }} label={translate('resources.books.actions.unpublishSelected')} />
      <BulkDeleteButton />
    </>
  );
};

export const BookList = () => {
  const { contentLanguage } = useContentLanguage();

  return (
    <>
      <ContentModeIndicator />
      <List
        key={contentLanguage}
        filters={bookFilters}
        actions={<ListActions />}
        perPage={25}
        sort={{ field: 'createdAt', order: 'DESC' }}
      >
        <Datagrid rowClick="show" bulkActionButtons={<BulkActionButtons />}>
          <CoverField label="Cover" />
          <TextField source="title" />
          <TextField source="author" />
          <LanguageField label="Lang" />
          <SourceField label="Source" />
          <StatusField label="Status" />
          <ContentReviewStatusField label="Review" />
          <DifficultyField label="Difficulty" />
          <NumberField source="chapterCount" label="Chapters" />
          <WordCountField label="Words" />
          <TimezoneAwareDateField source="createdAt" label="Created" />
          <ReviewInStudioButton />
          <PublishButton />
          <UnpublishButton />
          <EditButton />
          <ShowButton />
        </Datagrid>
      </List>
    </>
  );
};

// HSK levels for Chinese books
const HSK_LEVELS = [
  { id: 1, name: 'HSK 1' }, { id: 2, name: 'HSK 2' }, { id: 3, name: 'HSK 3' },
  { id: 4, name: 'HSK 4' }, { id: 5, name: 'HSK 5' }, { id: 6, name: 'HSK 6' },
  { id: 7, name: 'HSK 7' }, { id: 8, name: 'HSK 8' }, { id: 9, name: 'HSK 9' },
];

// CEFR levels for English books
const CEFR_LEVELS = [
  { id: 'A1', name: 'A1 - Beginner' },
  { id: 'A2', name: 'A2 - Elementary' },
  { id: 'B1', name: 'B1 - Intermediate' },
  { id: 'B2', name: 'B2 - Upper Intermediate' },
  { id: 'C1', name: 'C1 - Advanced' },
  { id: 'C2', name: 'C2 - Proficient' },
];

// Language variants
const LANGUAGE_VARIANTS = [
  { id: 'en-US', name: 'English (US)' },
  { id: 'en-GB', name: 'English (UK)' },
  { id: 'zh-Hans', name: '简体中文' },
  { id: 'zh-Hant', name: '繁體中文' },
];

// Original script options for Chinese
const ORIGINAL_SCRIPTS = [
  { id: 'simplified', name: '简体' },
  { id: 'traditional', name: '繁体' },
];

export const BookEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" fullWidth />
      <TextInput source="author" fullWidth />
      <TextInput source="description" multiline rows={4} fullWidth />
      <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
        <SelectInput source="language" choices={LANGUAGES} label="Language" />
        <SelectInput source="languageVariant" choices={LANGUAGE_VARIANTS} label="Variant" />
        <SelectInput source="status" choices={BOOK_STATUSES} />
        <SelectInput source="source" choices={BOOK_SOURCES} />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
        <NumberInput source="difficultyScore" min={0} max={100} label="Difficulty (0-100)" />
        <SelectInput source="cefrLevel" choices={CEFR_LEVELS} label="CEFR Level (English)" />
        <SelectInput source="hskLevel" choices={HSK_LEVELS} label="HSK Level (Chinese)" />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
        <TextInput source="dynasty" label="Dynasty (中文古籍)" />
        <SelectInput source="originalScript" choices={ORIGINAL_SCRIPTS} label="Original Script" />
      </Stack>
      <TextInput source="coverUrl" fullWidth label="Cover URL" />
      <TextInput source="coverThumbUrl" fullWidth label="Thumbnail URL" />
      <TextInput source="epubUrl" fullWidth label="EPUB URL" />
      <TextInput source="sourceUrl" fullWidth label="Source URL" />
    </SimpleForm>
  </Edit>
);

export const BookCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" fullWidth required />
      <TextInput source="author" fullWidth required />
      <TextInput source="description" multiline rows={4} fullWidth />
      <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
        <SelectInput source="language" choices={LANGUAGES} defaultValue="en" label="Language" required />
        <SelectInput source="languageVariant" choices={LANGUAGE_VARIANTS} label="Variant" />
        <SelectInput source="source" choices={BOOK_SOURCES} defaultValue="USER_UPLOAD" />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
        <NumberInput source="difficultyScore" min={0} max={100} defaultValue={50} label="Difficulty" />
        <SelectInput source="cefrLevel" choices={CEFR_LEVELS} label="CEFR Level (English)" />
        <SelectInput source="hskLevel" choices={HSK_LEVELS} label="HSK Level (Chinese)" />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
        <TextInput source="dynasty" label="Dynasty (中文古籍)" />
        <SelectInput source="originalScript" choices={ORIGINAL_SCRIPTS} label="Original Script" />
      </Stack>
      <TextInput source="epubUrl" fullWidth required label="EPUB URL" />
      <TextInput source="coverUrl" fullWidth label="Cover URL" />
    </SimpleForm>
  </Create>
);

const ShowCoverField = () => {
  const record = useRecordContext();
  if (!record) return null;

  const url = getProxyUrl(record.coverUrl) || getProxyUrl(record.coverThumbUrl);
  if (!url) return <Box sx={{ width: 150, height: 220, bgcolor: '#eee', borderRadius: 1 }} />;

  return (
    <img
      src={url}
      alt={record.title}
      style={{ maxWidth: 200, borderRadius: 4 }}
    />
  );
};

const BookHeader = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box
        component="h1"
        sx={{
          fontSize: 28,
          fontWeight: 700,
          color: 'text.primary',
          m: 0,
          lineHeight: 1.3,
        }}
      >
        {record.title}
      </Box>
      <Box
        sx={{
          fontSize: 18,
          color: 'text.secondary',
          fontWeight: 400,
        }}
      >
        by {record.author}
      </Box>
    </Box>
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

export const BookShow = () => (
  <Show actions={<ShowActions />}>
    <SimpleShowLayout>
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <ShowCoverField />
        <BookHeader />
      </Box>
      <RichTextField source="description" />
      <FunctionField
        label="Difficulty"
        render={(record: { difficultyScore?: number }) =>
          record?.difficultyScore != null ? `${record.difficultyScore}/100` : 'N/A'
        }
      />
      <NumberField source="wordCount" label="Total Words" />
      <NumberField source="chapterCount" label="Total Chapters" />
      <NumberField source="fleschScore" label="Flesch Score" />
      <TextField source="source" />
      <TextField source="sourceUrl" label="Source URL" />
      <TextField source="status" />
      <TimezoneAwareDateField source="publishedAt" showTime label="Published At" />
      <TimezoneAwareDateField source="createdAt" showTime />
      <TimezoneAwareDateField source="updatedAt" showTime />
      <Box mt={2} display="flex" gap={1}>
        <PublishButton />
        <UnpublishButton />
      </Box>
    </SimpleShowLayout>
  </Show>
);
