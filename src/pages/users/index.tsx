import {
  List,
  Datagrid,
  TextField,
  EmailField,
  NumberField,
  ShowButton,
  Show,
  useRecordContext,
  SearchInput,
  SelectInput,
  TabbedShowLayout,
  Tab,
  ReferenceManyField,
  FunctionField,
  TopToolbar,
  ListButton,
  useTranslate,
} from 'react-admin';
import { TimezoneAwareDateField } from '../../components/TimezoneAwareDateField';
import { Chip, Box, Typography, LinearProgress, Grid, Card, CardContent, Avatar, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';
import LanguageIcon from '@mui/icons-material/Language';

// English level enum matching Prisma schema (only 3 levels)
const useEnglishLevelChoices = () => {
  const translate = useTranslate();
  return [
    { id: 'BEGINNER', name: translate('resources.users.level.beginner') },
    { id: 'INTERMEDIATE', name: translate('resources.users.level.intermediate') },
    { id: 'ADVANCED', name: translate('resources.users.level.advanced') },
  ];
};

const usePlanTypeChoices = () => {
  const translate = useTranslate();
  return [
    { id: 'FREE', name: translate('resources.users.plan.free') },
    { id: 'PRO', name: translate('resources.users.plan.pro') },
    { id: 'PREMIUM', name: translate('resources.users.plan.premium') },
  ];
};

const usePlatformChoices = () => {
  return [
    { id: 'IOS', name: 'iOS' },
    { id: 'ANDROID', name: 'Android' },
    { id: 'WEB', name: 'Web' },
  ];
};

const UserFilters = () => {
  const translate = useTranslate();
  const englishLevels = useEnglishLevelChoices();
  const planTypes = usePlanTypeChoices();
  const platforms = usePlatformChoices();

  return [
    <SearchInput source="search" alwaysOn key="search" />,
    <SelectInput source="englishLevel" choices={englishLevels} key="level" />,
    <SelectInput source="planType" choices={planTypes} key="plan" />,
    <SelectInput source="platform" choices={platforms} label={translate('resources.users.fields.platform')} key="platform" />,
  ];
};

const AvatarField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Avatar
      src={record.avatarUrl}
      alt={record.displayName || record.email}
      sx={{ width: 32, height: 32 }}
    >
      {(record.displayName || record.email || '?')[0].toUpperCase()}
    </Avatar>
  );
};

const EnglishLevelField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;

  const colors: Record<string, 'default' | 'primary' | 'success'> = {
    BEGINNER: 'default',
    INTERMEDIATE: 'primary',
    ADVANCED: 'success',
  };

  const getLabel = (level: string) => {
    const levelMap: Record<string, string> = {
      BEGINNER: translate('resources.users.level.beginner'),
      INTERMEDIATE: translate('resources.users.level.intermediate'),
      ADVANCED: translate('resources.users.level.advanced'),
    };
    return levelMap[level] || level;
  };

  return (
    <Chip
      label={getLabel(record.englishLevel)}
      color={colors[record.englishLevel] || 'default'}
      size="small"
    />
  );
};

const PlanBadge = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;

  const planType = record.subscription?.planType || 'FREE';

  const colors: Record<string, 'default' | 'primary' | 'success'> = {
    FREE: 'default',
    PRO: 'primary',
    PREMIUM: 'success',
  };

  const getPlanLabel = (plan: string) => {
    const planMap: Record<string, string> = {
      FREE: translate('resources.users.plan.free'),
      PRO: translate('resources.users.plan.pro'),
      PREMIUM: translate('resources.users.plan.premium'),
    };
    return planMap[plan] || plan;
  };

  return (
    <Chip
      label={getPlanLabel(planType)}
      color={colors[planType] || 'default'}
      size="small"
      variant="outlined"
    />
  );
};

const ReadingTimeField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return <span>-</span>;

  const minutes = record.totalReadingMinutes || 0;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return <span>{hours}h {mins}m</span>;
  }
  return <span>{minutes}m</span>;
};

const StreakField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return <span>-</span>;

  const streak = record.streakDays || 0;

  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <span>{streak}</span>
      {streak >= 7 && <span>🔥</span>}
    </Box>
  );
};

const PlatformField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return <span>-</span>;

  const platforms: string[] = record.platforms || [];

  if (platforms.length === 0) {
    return <span>-</span>;
  }

  const platformIcons: Record<string, { icon: React.ReactNode; color: string }> = {
    IOS: { icon: <AppleIcon fontSize="small" />, color: '#000000' },
    ANDROID: { icon: <AndroidIcon fontSize="small" />, color: '#3DDC84' },
    WEB: { icon: <LanguageIcon fontSize="small" />, color: '#1976d2' },
  };

  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      {platforms.map((platform: string) => {
        const config = platformIcons[platform];
        if (!config) return null;
        return (
          <Tooltip key={platform} title={platform === 'IOS' ? 'iOS' : platform === 'ANDROID' ? 'Android' : 'Web'}>
            <Box sx={{ color: config.color, display: 'flex', alignItems: 'center' }}>
              {config.icon}
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export const UserList = () => {
  const translate = useTranslate();
  const userFilters = UserFilters();

  return (
    <List filters={userFilters} perPage={25} sort={{ field: 'createdAt', order: 'DESC' }}>
      <Datagrid rowClick="show">
        <AvatarField label="" />
        <TextField source="displayName" label={translate('resources.users.fields.name')} />
        <EmailField source="email" label={translate('resources.users.fields.email')} />
        <PlatformField label={translate('resources.users.fields.platform')} />
        <EnglishLevelField label={translate('resources.users.fields.level')} />
        <PlanBadge label={translate('resources.users.fields.plan')} />
        <StreakField label={translate('resources.users.fields.streak')} />
        <ReadingTimeField label={translate('resources.users.fields.readingTime')} />
        <NumberField source="totalWordsLearned" label={translate('resources.users.fields.words')} />
        <TimezoneAwareDateField source="lastActiveAt" label={translate('resources.users.fields.lastActive')} />
        <TimezoneAwareDateField source="createdAt" label={translate('resources.users.fields.joined')} />
        <ShowButton />
      </Datagrid>
    </List>
  );
};

const UserStats = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;

  const goalProgress = Math.min(
    100,
    ((record.todayReadingMinutes || 0) / (record.dailyGoalMinutes || 30)) * 100
  );

  const totalMinutes = record.totalReadingMinutes || 0;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {translate('resources.users.stats.totalReadingTime')}
            </Typography>
            <Typography variant="h4">
              {hours}h {minutes}m
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {translate('resources.users.stats.wordsLearned')}
            </Typography>
            <Typography variant="h4">{record.totalWordsLearned || 0}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {translate('resources.users.stats.currentStreak')}
            </Typography>
            <Typography variant="h4">
              {record.streakDays || 0} {translate('resources.users.stats.days')} {(record.streakDays || 0) >= 7 ? '🔥' : ''}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {translate('resources.users.stats.todayProgress', {
                current: record.todayReadingMinutes || 0,
                goal: record.dailyGoalMinutes || 30,
              })}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={goalProgress}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const ShowActions = () => {
  const translate = useTranslate();
  return (
    <TopToolbar sx={{ justifyContent: 'flex-start' }}>
      <ListButton label={translate('resources.users.actions.back')} icon={<ArrowBackIcon />} />
    </TopToolbar>
  );
};

export const UserShow = () => {
  const translate = useTranslate();

  return (
    <Show actions={<ShowActions />}>
      <TabbedShowLayout>
        <Tab label={translate('resources.users.tabs.profile')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <FunctionField
              render={(record: { avatarUrl?: string; displayName?: string; email?: string }) => (
                <Avatar
                  src={record?.avatarUrl}
                  sx={{ width: 80, height: 80, fontSize: 32 }}
                >
                  {(record?.displayName || record?.email || '?')[0].toUpperCase()}
                </Avatar>
              )}
            />
            <Box>
              <TextField source="displayName" sx={{ fontSize: 24, fontWeight: 'bold' }} />
              <EmailField source="email" sx={{ color: 'text.secondary' }} />
            </Box>
          </Box>
          <TextField source="id" label={translate('resources.users.fields.userId')} />
          <TextField source="englishLevel" label={translate('resources.users.fields.englishLevel')} />
          <NumberField source="dailyGoalMinutes" label={translate('resources.users.fields.dailyGoal')} />
          <FunctionField
            label={translate('resources.users.fields.loginMethod')}
            render={(record: { appleId?: string; googleId?: string }) => {
              const methods = [];
              if (record?.appleId) methods.push('Apple');
              if (record?.googleId) methods.push('Google');
              return methods.length > 0 ? methods.join(', ') : 'Email';
            }}
          />
          <TimezoneAwareDateField source="createdAt" showTime label={translate('resources.users.fields.registered')} />
          <TimezoneAwareDateField source="lastActiveAt" showTime label={translate('resources.users.fields.lastActive')} />
        </Tab>

        <Tab label={translate('resources.users.tabs.statistics')}>
          <UserStats />
        </Tab>

        <Tab label={translate('resources.users.tabs.library')}>
          <ReferenceManyField reference="user-books" target="userId" label="">
            <Datagrid>
              <TextField source="book.title" label={translate('resources.users.library.book')} />
              <TextField source="status" label={translate('resources.users.library.status')} />
              <FunctionField
                label={translate('resources.users.library.progress')}
                render={(record: { progressPercent?: number }) =>
                  `${Math.round(record?.progressPercent || 0)}%`
                }
              />
              <NumberField source="totalReadingMinutes" label={translate('resources.users.library.time')} />
              <TimezoneAwareDateField source="lastReadAt" label={translate('resources.users.library.lastRead')} />
            </Datagrid>
          </ReferenceManyField>
        </Tab>

        <Tab label={translate('resources.users.tabs.vocabulary')}>
          <ReferenceManyField reference="user-vocabulary" target="userId" label="">
            <Datagrid>
              <TextField source="vocabulary.word" label={translate('resources.users.vocabulary.word')} />
              <TextField source="masteryLevel" label={translate('resources.users.vocabulary.mastery')} />
              <NumberField source="repetitions" label={translate('resources.users.vocabulary.repetitions')} />
              <TimezoneAwareDateField source="nextReviewAt" label={translate('resources.users.vocabulary.nextReview')} />
            </Datagrid>
          </ReferenceManyField>
        </Tab>
      </TabbedShowLayout>
    </Show>
  );
};
