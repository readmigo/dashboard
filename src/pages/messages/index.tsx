import {
  List,
  Datagrid,
  TextField,
  ShowButton,
  Show,
  SimpleShowLayout,
  useRecordContext,
  SearchInput,
  SelectInput,
  TopToolbar,
  ListButton,
  useDataProvider,
  useNotify,
  useRefresh,
  FunctionField,
  ReferenceField,
  ExportButton,
  useTranslate,
  useListContext,
} from 'react-admin';
import {
  Chip,
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  TextField as MuiTextField,
  Button,
  Paper,
  Grid,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ImageIcon from '@mui/icons-material/Image';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState, useEffect, useMemo } from 'react';
import DebugErrorBoundary, { debugLog } from '../../components/DebugErrorBoundary';
import { useTimezone } from '../../contexts/TimezoneContext';
import { TimezoneAwareDateField } from '../../components/TimezoneAwareDateField';

// Enums matching backend - will be translated via useTranslate
const MESSAGE_TYPE_IDS = ['TECHNICAL_ISSUE', 'FEATURE_SUGGESTION', 'GENERAL_INQUIRY', 'PROBLEM_REPORT', 'COMPLAINT', 'BUSINESS_INQUIRY'] as const;
const THREAD_STATUS_IDS = ['OPEN', 'REPLIED', 'CLOSED', 'RESOLVED'] as const;

// Reply templates for quick responses - template names will be translated, content stays in English
const REPLY_TEMPLATE_IDS = ['thanks_feedback', 'issue_received', 'feature_noted', 'bug_fixed', 'need_more_info'] as const;

const REPLY_TEMPLATE_CONTENTS: Record<string, string> = {
  thanks_feedback: `Thank you for your feedback! We truly appreciate you taking the time to share your thoughts with us. Your input helps us improve Readmigo for everyone.

If you have any additional questions or suggestions, please don't hesitate to reach out.

Best regards,
Readmigo Team`,
  issue_received: `Thank you for reporting this issue. We've received your message and our team is looking into it.

We will update you as soon as we have more information. In the meantime, please let us know if you have any additional details that might help us investigate.

Best regards,
Readmigo Team`,
  feature_noted: `Thank you for your feature suggestion! We love hearing ideas from our users on how to improve Readmigo.

We've added your suggestion to our product roadmap for consideration. While we can't guarantee when or if it will be implemented, your feedback is valuable and helps shape the future of our app.

Best regards,
Readmigo Team`,
  bug_fixed: `Great news! The issue you reported has been fixed in our latest update.

Please update to the latest version of Readmigo from the App Store to get this fix. If you continue to experience issues after updating, please let us know.

Thank you for helping us improve Readmigo!

Best regards,
Readmigo Team`,
  need_more_info: `Thank you for reaching out. To help us better understand and resolve your issue, could you please provide us with the following information:

1. What were you trying to do when the issue occurred?
2. What happened instead?
3. Does this happen every time or only sometimes?

Any screenshots or additional details would also be helpful.

Best regards,
Readmigo Team`,
};

// Filters hook - returns memoized filter array
const useMessageFilters = () => {
  const translate = useTranslate();

  return useMemo(() => [
    <SearchInput
      key="search"
      source="search"
      alwaysOn
      placeholder={translate('resources.messages.searchPlaceholder')}
    />,
    <SelectInput
      key="status"
      source="status"
      choices={THREAD_STATUS_IDS.map(id => ({
        id,
        name: translate(`resources.messages.status.${id}`),
      }))}
    />,
    <SelectInput
      key="type"
      source="type"
      choices={MESSAGE_TYPE_IDS.map(id => ({
        id,
        name: translate(`resources.messages.type.${id}`),
      }))}
    />,
  ], [translate]);
};

// Type icon component
const TypeIcon = ({ type }: { type: string }) => {
  const icons: Record<string, string> = {
    TECHNICAL_ISSUE: '❓',
    FEATURE_SUGGESTION: '💡',
    GENERAL_INQUIRY: '💬',
    PROBLEM_REPORT: '⚠️',
    COMPLAINT: '📢',
    BUSINESS_INQUIRY: '🤝',
  };
  return <span>{icons[type] || '📧'}</span>;
};

// Status chip component
const StatusChip = ({ status }: { status: string }) => {
  const translate = useTranslate();
  const colors: Record<string, 'warning' | 'info' | 'default' | 'success'> = {
    OPEN: 'warning',
    REPLIED: 'info',
    CLOSED: 'default',
    RESOLVED: 'success',
  };

  return (
    <Chip
      label={translate(`resources.messages.status.${status}`, { _: status })}
      color={colors[status] || 'default'}
      size="small"
    />
  );
};

// Type chip component
const TypeChip = ({ type }: { type: string }) => {
  const translate = useTranslate();

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <TypeIcon type={type} />
      <span>{translate(`resources.messages.type.${type}`, { _: type })}</span>
    </Box>
  );
};

// Type field for list
const TypeField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  return <TypeChip type={record.type} />;
};

// Status field for list
const StatusField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  return <StatusChip status={record.status} />;
};

// Message list actions
const MessageListActions = () => (
  <TopToolbar>
    <ExportButton />
  </TopToolbar>
);

// Debug wrapper to log list data
const MessageListDebugWrapper = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, error } = useListContext();

  useEffect(() => {
    debugLog('MessageList', 'list context state', {
      isLoading,
      error: error ? String(error) : null,
      dataCount: data?.length ?? 0,
    });

    if (data && data.length > 0) {
      debugLog('MessageList', 'first record sample', {
        id: data[0].id,
        type: data[0].type,
        status: data[0].status,
        subject: data[0].subject,
        updatedAt: data[0].updatedAt,
        createdAt: data[0].createdAt,
        updatedAtType: typeof data[0].updatedAt,
        createdAtType: typeof data[0].createdAt,
      });
    }

    if (error) {
      debugLog('MessageList', 'ERROR in list context', { error: String(error), stack: (error as Error)?.stack });
    }
  }, [data, isLoading, error]);

  return <>{children}</>;
};

// Message list
export const MessageList = () => {
  const translate = useTranslate();
  const messageFilters = useMessageFilters();

  debugLog('MessageList', 'component rendering');

  return (
    <DebugErrorBoundary componentName="MessageList">
      <List
        filters={messageFilters}
        perPage={25}
        sort={{ field: 'updatedAt', order: 'DESC' }}
        resource="messages"
        actions={<MessageListActions />}
      >
        <MessageListDebugWrapper>
          <Datagrid rowClick="show" bulkActionButtons={false}>
            <TypeField label={translate('resources.messages.fields.type')} />
            <ReferenceField source="userId" reference="users" link="show" label={translate('resources.messages.fields.user')}>
              <TextField source="email" />
            </ReferenceField>
            <TextField source="subject" label={translate('resources.messages.fields.subject')} />
            <StatusField label={translate('resources.messages.fields.status')} />
            <FunctionField
              label={translate('resources.messages.fields.unread')}
              render={(record: { unreadCount?: number }) =>
                record?.unreadCount ? (
                  <Chip label={record.unreadCount} color="error" size="small" />
                ) : null
              }
            />
            <TimezoneAwareDateField source="updatedAt" showTime label={translate('resources.messages.fields.lastUpdate')} />
            <TimezoneAwareDateField source="createdAt" showTime label={translate('resources.messages.fields.created')} />
            <ShowButton />
          </Datagrid>
        </MessageListDebugWrapper>
      </List>
    </DebugErrorBoundary>
  );
};

// Message bubble component
interface MessageBubbleProps {
  message: {
    id: string;
    senderType: string;
    content: string;
    createdAt: string;
    deviceInfo?: {
      model?: string;
      systemVersion?: string;
      appVersion?: string;
    };
    attachments?: Array<{
      id: string;
      url: string;
      thumbnailUrl?: string;
      fileName?: string;
    }>;
    ratings?: Array<{
      rating: string;
    }>;
  };
  isUser: boolean;
}

// Rating chip component with translation
const RatingChip = ({ rating }: { rating: string | null }) => {
  const translate = useTranslate();
  if (!rating) return null;

  return (
    <Chip
      label={rating === 'HELPFUL'
        ? `👍 ${translate('resources.messages.rating.helpful')}`
        : `👎 ${translate('resources.messages.rating.notHelpful')}`}
      size="small"
      color={rating === 'HELPFUL' ? 'success' : 'error'}
      sx={{ mt: 1 }}
    />
  );
};

const MessageBubble = ({ message, isUser }: MessageBubbleProps) => {
  const { formatDateTime } = useTimezone();
  const hasRating = message.ratings && message.ratings.length > 0;
  const rating = hasRating ? message.ratings![0].rating : null;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: '70%',
          display: 'flex',
          flexDirection: isUser ? 'row-reverse' : 'row',
          gap: 1,
        }}
      >
        <Avatar
          sx={{
            bgcolor: isUser ? 'primary.main' : 'success.main',
            width: 36,
            height: 36,
          }}
        >
          {isUser ? <PersonIcon /> : <SupportAgentIcon />}
        </Avatar>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            bgcolor: isUser ? 'grey.100' : 'primary.50',
            borderRadius: 2,
          }}
        >
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Typography>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {message.attachments.map((att) => (
                <Box
                  key={att.id}
                  component="a"
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    p: 0.5,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'grey.50' },
                  }}
                >
                  {att.thumbnailUrl ? (
                    <Box
                      component="img"
                      src={att.thumbnailUrl}
                      alt=""
                      sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1 }}
                    />
                  ) : (
                    <ImageIcon fontSize="small" />
                  )}
                  {att.fileName && (
                    <Typography variant="caption">{att.fileName}</Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {/* Device info (for first user message) */}
          {isUser && message.deviceInfo && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 1 }}
            >
              {message.deviceInfo.model} | {message.deviceInfo.systemVersion} | App{' '}
              {message.deviceInfo.appVersion}
            </Typography>
          )}

          {/* Rating indicator */}
          {hasRating && (
            <RatingChip rating={rating} />
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 1, textAlign: isUser ? 'right' : 'left' }}
          >
            {formatDateTime(message.createdAt)}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

// Status change component
interface StatusChangeProps {
  threadId: string;
  currentStatus: string;
  onSuccess: () => void;
}

const StatusChange = ({ threadId, currentStatus, onSuccess }: StatusChangeProps) => {
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const translate = useTranslate();

  const THREAD_STATUSES = THREAD_STATUS_IDS.map(id => ({
    id,
    name: translate(`resources.messages.status.${id}`),
  }));

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;

    setUpdating(true);
    try {
      await dataProvider.update(`messages`, {
        id: threadId,
        data: { status: newStatus },
        previousData: { id: threadId, status },
      });
      setStatus(newStatus);
      notify(translate('resources.messages.notifications.statusUpdated'), { type: 'success' });
      onSuccess();
    } catch (error) {
      notify(translate('resources.messages.notifications.statusUpdateFailed'), { type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>{translate('resources.messages.fields.status')}</InputLabel>
      <Select
        value={status}
        label={translate('resources.messages.fields.status')}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={updating}
      >
        {THREAD_STATUSES.map((s) => (
          <MenuItem key={s.id} value={s.id}>
            {s.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

// Reply form component
interface ReplyFormProps {
  threadId: string;
  onSuccess: () => void;
}

const ReplyForm = ({ threadId, onSuccess }: ReplyFormProps) => {
  const [content, setContent] = useState('');
  const [closeAfterReply, setCloseAfterReply] = useState(false);
  const [sending, setSending] = useState(false);
  const [templateAnchorEl, setTemplateAnchorEl] = useState<null | HTMLElement>(null);
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const translate = useTranslate();

  const REPLY_TEMPLATES = REPLY_TEMPLATE_IDS.map(id => ({
    id,
    name: translate(`resources.messages.templates.${id}`),
    content: REPLY_TEMPLATE_CONTENTS[id],
  }));

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setSending(true);
    try {
      await dataProvider.create(`messages/threads/${threadId}/reply`, {
        data: { content, closeAfterReply },
      });
      notify(translate('resources.messages.notifications.replySent'), { type: 'success' });
      setContent('');
      setCloseAfterReply(false);
      onSuccess();
    } catch (error) {
      notify(translate('resources.messages.notifications.replyFailed'), { type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleTemplateSelect = (template: typeof REPLY_TEMPLATES[0]) => {
    setContent(template.content);
    setTemplateAnchorEl(null);
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
      <MuiTextField
        fullWidth
        multiline
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={translate('resources.messages.replyPlaceholder')}
        variant="outlined"
        disabled={sending}
      />
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            size="small"
            endIcon={<ExpandMoreIcon />}
            onClick={(e) => setTemplateAnchorEl(e.currentTarget)}
            disabled={sending}
          >
            {translate('resources.messages.template')}
          </Button>
          <Menu
            anchorEl={templateAnchorEl}
            open={Boolean(templateAnchorEl)}
            onClose={() => setTemplateAnchorEl(null)}
          >
            {REPLY_TEMPLATES.map((template) => (
              <MenuItem
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
              >
                {template.name}
              </MenuItem>
            ))}
          </Menu>
          <FormControlLabel
            control={
              <Checkbox
                checked={closeAfterReply}
                onChange={(e) => setCloseAfterReply(e.target.checked)}
                disabled={sending}
              />
            }
            label={translate('resources.messages.resolveAndClose')}
          />
        </Box>
        <Button
          variant="contained"
          endIcon={sending ? <CircularProgress size={16} /> : <SendIcon />}
          onClick={handleSubmit}
          disabled={!content.trim() || sending}
        >
          {translate('resources.messages.sendReply')}
        </Button>
      </Box>
    </Box>
  );
};

// Thread detail component
const ThreadDetail = () => {
  const record = useRecordContext();
  const refresh = useRefresh();
  const translate = useTranslate();
  const { formatDateTime } = useTimezone();

  useEffect(() => {
    debugLog('ThreadDetail', 'record loaded', {
      id: record?.id,
      type: record?.type,
      status: record?.status,
      messagesCount: record?.messages?.length ?? 0,
      createdAt: record?.createdAt,
      updatedAt: record?.updatedAt,
      closedAt: record?.closedAt,
    });

    if (record?.messages && record.messages.length > 0) {
      debugLog('ThreadDetail', 'first message sample', {
        id: record.messages[0].id,
        senderType: record.messages[0].senderType,
        createdAt: record.messages[0].createdAt,
        createdAtType: typeof record.messages[0].createdAt,
      });
    }
  }, [record]);

  if (!record) {
    debugLog('ThreadDetail', 'no record available');
    return null;
  }

  return (
    <Box>
      {/* Header info */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                {record.subject}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                <TypeChip type={record.type} />
                <StatusChange
                  threadId={String(record.id)}
                  currentStatus={record.status}
                  onSuccess={refresh}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {translate('resources.messages.fields.user')}
              </Typography>
              <Typography variant="body1">
                {record.userId}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                {translate('resources.messages.fields.created')}: {formatDateTime(record.createdAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {translate('resources.messages.fields.lastUpdate')}: {formatDateTime(record.updatedAt)}
              </Typography>
              {record.closedAt && (
                <Typography variant="body2" color="text.secondary">
                  {translate('resources.messages.fields.closed')}: {formatDateTime(record.closedAt)}
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader title={translate('resources.messages.conversation')} />
        <Divider />
        <CardContent sx={{ maxHeight: 500, overflowY: 'auto' }}>
          {record.messages?.map((message: MessageBubbleProps['message']) => (
            <MessageBubble
              key={message.id}
              message={message}
              isUser={message.senderType === 'USER'}
            />
          ))}
        </CardContent>

        {/* Reply form - only if thread is not closed */}
        {record.status !== 'CLOSED' && record.status !== 'RESOLVED' && (
          <ReplyForm threadId={String(record.id)} onSuccess={refresh} />
        )}

        {/* Closed thread notice */}
        {(record.status === 'CLOSED' || record.status === 'RESOLVED') && (
          <Box sx={{ p: 2, bgcolor: 'grey.100', textAlign: 'center' }}>
            <Typography color="text.secondary">
              {translate(`resources.messages.threadClosed.${record.status}`)}
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
};

// Show actions
const ShowActions = () => {
  const translate = useTranslate();
  return (
    <TopToolbar sx={{ justifyContent: 'flex-start' }}>
      <ListButton label={translate('resources.messages.backToList')} icon={<ArrowBackIcon />} />
    </TopToolbar>
  );
};

// Message show
export const MessageShow = () => {
  debugLog('MessageShow', 'component rendering');

  return (
    <DebugErrorBoundary componentName="MessageShow">
      <Show actions={<ShowActions />} resource="messages">
        <SimpleShowLayout>
          <ThreadDetail />
        </SimpleShowLayout>
      </Show>
    </DebugErrorBoundary>
  );
};

// Stats card component for dashboard
export const MessagesStats = () => {
  const dataProvider = useDataProvider();
  const translate = useTranslate();
  const [stats, setStats] = useState<{
    openThreads?: number;
    totalThreads?: number;
    avgResponseTimeMinutes?: number;
    helpfulRatings?: number;
    notHelpfulRatings?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    debugLog('MessagesStats', 'fetching stats');
    dataProvider
      .getOne('messages/stats', { id: '' })
      .then(({ data }) => {
        debugLog('MessagesStats', 'stats loaded', data);
        setStats(data);
        setLoading(false);
      })
      .catch((error) => {
        debugLog('MessagesStats', 'ERROR loading stats', { error: String(error), stack: error?.stack });
        setLoading(false);
      });
  }, [dataProvider]);

  if (loading) return <CircularProgress size={24} />;
  if (!stats) return null;

  return (
    <Card>
      <CardHeader title={translate('resources.messages.stats.title')} />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="h4" color="warning.main">
              {stats.openThreads || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {translate('resources.messages.stats.openThreads')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h4">{stats.totalThreads || 0}</Typography>
            <Typography variant="body2" color="text.secondary">
              {translate('resources.messages.stats.totalThreads')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h4">
              {stats.avgResponseTimeMinutes ? `${Math.round(stats.avgResponseTimeMinutes)}m` : '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {translate('resources.messages.stats.avgResponseTime')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h4" color="success.main">
              {stats.helpfulRatings || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {translate('resources.messages.stats.helpfulRatings')}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
