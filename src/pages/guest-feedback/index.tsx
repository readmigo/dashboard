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
  useNotify,
  useRefresh,
  FunctionField,
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
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState, useEffect, useMemo } from 'react';
import DebugErrorBoundary, { debugLog } from '../../components/DebugErrorBoundary';
import { getStoredEnvironment } from '../../contexts/EnvironmentContext';
import { getApiUrl } from '../../config/environments';
import { useTimezone } from '../../contexts/TimezoneContext';
import { TimezoneAwareDateField } from '../../components/TimezoneAwareDateField';

// Helper to get API base URL for custom fetch calls
const getApiBaseUrl = () => {
  const env = getStoredEnvironment();
  return `${getApiUrl(env)}/api/v1/admin`;
};

// Enums matching backend - will be translated via useTranslate
const MESSAGE_TYPE_IDS = ['TECHNICAL_ISSUE', 'FEATURE_SUGGESTION', 'GENERAL_INQUIRY', 'PROBLEM_REPORT', 'COMPLAINT', 'BUSINESS_INQUIRY'] as const;
const FEEDBACK_STATUS_IDS = ['OPEN', 'REPLIED', 'CLOSED'] as const;

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
const useFeedbackFilters = () => {
  const translate = useTranslate();

  return useMemo(() => [
    <SearchInput
      key="search"
      source="search"
      alwaysOn
      placeholder={translate('resources.guestFeedback.searchPlaceholder')}
    />,
    <SelectInput
      key="status"
      source="status"
      choices={FEEDBACK_STATUS_IDS.map(id => ({
        id,
        name: translate(`resources.guestFeedback.status.${id}`),
      }))}
    />,
    <SelectInput
      key="type"
      source="type"
      choices={MESSAGE_TYPE_IDS.map(id => ({
        id,
        name: translate(`resources.guestFeedback.type.${id}`),
      }))}
    />,
  ], [translate]);
};

// Debug wrapper for list context
const FeedbackListDebugWrapper = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, error } = useListContext();

  useEffect(() => {
    debugLog('GuestFeedbackList', 'list context state', {
      isLoading,
      error: error ? String(error) : null,
      dataCount: data?.length ?? 0,
    });

    if (data && data.length > 0) {
      debugLog('GuestFeedbackList', 'first record sample', {
        id: data[0].id,
        type: data[0].type,
        status: data[0].status,
        subject: data[0].subject,
        deviceId: data[0].deviceId,
      });
    }

    if (error) {
      debugLog('GuestFeedbackList', 'ERROR in list context', { error: String(error), stack: (error as Error)?.stack });
    }
  }, [data, isLoading, error]);

  return <>{children}</>;
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
  };

  return (
    <Chip
      label={translate(`resources.guestFeedback.status.${status}`, { _: status })}
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
      <span>{translate(`resources.guestFeedback.type.${type}`, { _: type })}</span>
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

// List actions
const FeedbackListActions = () => (
  <TopToolbar>
    <ExportButton />
  </TopToolbar>
);

// Guest Feedback list
export const GuestFeedbackList = () => {
  const translate = useTranslate();
  const feedbackFilters = useFeedbackFilters();

  debugLog('GuestFeedbackList', 'component rendering');

  return (
    <DebugErrorBoundary componentName="GuestFeedbackList">
      <List
        filters={feedbackFilters}
        perPage={25}
        sort={{ field: 'createdAt', order: 'DESC' }}
        resource="guest-feedback"
        actions={<FeedbackListActions />}
      >
        <FeedbackListDebugWrapper>
          <Datagrid rowClick="show" bulkActionButtons={false}>
            <TypeField label={translate('resources.guestFeedback.fields.type')} />
            <FunctionField
              label={translate('resources.guestFeedback.fields.device')}
              render={(record: { deviceId?: string }) =>
                record?.deviceId ? (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <PhoneIphoneIcon fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {record.deviceId.substring(0, 8)}...
                    </Typography>
                  </Box>
                ) : null
              }
            />
            <TextField source="subject" label={translate('resources.guestFeedback.fields.subject')} />
            <StatusField label={translate('resources.guestFeedback.fields.status')} />
            <FunctionField
              label={translate('resources.guestFeedback.fields.replied')}
              render={(record: { adminReply?: string }) =>
                record?.adminReply ? (
                  <Chip label={translate('common.yes')} color="success" size="small" />
                ) : (
                  <Chip label={translate('common.no')} color="default" size="small" variant="outlined" />
                )
              }
            />
            <TimezoneAwareDateField source="createdAt" showTime label={translate('resources.guestFeedback.fields.created')} />
            <ShowButton />
          </Datagrid>
        </FeedbackListDebugWrapper>
      </List>
    </DebugErrorBoundary>
  );
};

// Status change component
interface StatusChangeProps {
  feedbackId: string;
  currentStatus: string;
  onSuccess: () => void;
}

const StatusChange = ({ feedbackId, currentStatus, onSuccess }: StatusChangeProps) => {
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);
  const notify = useNotify();
  const translate = useTranslate();

  const FEEDBACK_STATUSES = FEEDBACK_STATUS_IDS.map(id => ({
    id,
    name: translate(`resources.guestFeedback.status.${id}`),
  }));

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;

    setUpdating(true);
    try {
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/guest-feedback/${feedbackId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          'X-Admin-Mode': 'true',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setStatus(newStatus);
      notify(translate('resources.guestFeedback.notifications.statusUpdated'), { type: 'success' });
      onSuccess();
    } catch (error) {
      notify(translate('resources.guestFeedback.notifications.statusUpdateFailed'), { type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>{translate('resources.guestFeedback.fields.status')}</InputLabel>
      <Select
        value={status}
        label={translate('resources.guestFeedback.fields.status')}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={updating}
      >
        {FEEDBACK_STATUSES.map((s) => (
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
  feedbackId: string;
  existingReply?: string;
  onSuccess: () => void;
}

const ReplyForm = ({ feedbackId, existingReply, onSuccess }: ReplyFormProps) => {
  const [content, setContent] = useState(existingReply || '');
  const [closeAfterReply, setCloseAfterReply] = useState(false);
  const [sending, setSending] = useState(false);
  const [templateAnchorEl, setTemplateAnchorEl] = useState<null | HTMLElement>(null);
  const notify = useNotify();
  const translate = useTranslate();

  const REPLY_TEMPLATES = REPLY_TEMPLATE_IDS.map(id => ({
    id,
    name: translate(`resources.guestFeedback.templates.${id}`),
    content: REPLY_TEMPLATE_CONTENTS[id],
  }));

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setSending(true);
    try {
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/guest-feedback/${feedbackId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          'X-Admin-Mode': 'true',
        },
        body: JSON.stringify({ reply: content, closeAfterReply }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      notify(translate('resources.guestFeedback.notifications.replySent'), { type: 'success' });
      setContent('');
      onSuccess();
    } catch (error) {
      notify(translate('resources.guestFeedback.notifications.replyFailed'), { type: 'error' });
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
      <Typography variant="subtitle2" gutterBottom>
        {existingReply ? translate('resources.guestFeedback.updateReply') : translate('resources.guestFeedback.sendReply')}
      </Typography>
      <MuiTextField
        fullWidth
        multiline
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={translate('resources.guestFeedback.replyPlaceholder')}
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
            {translate('resources.guestFeedback.template')}
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
            label={translate('resources.guestFeedback.closeAfterReply')}
          />
        </Box>
        <Button
          variant="contained"
          endIcon={sending ? <CircularProgress size={16} /> : <SendIcon />}
          onClick={handleSubmit}
          disabled={!content.trim() || sending}
        >
          {existingReply ? translate('resources.guestFeedback.updateReply') : translate('resources.guestFeedback.sendReply')}
        </Button>
      </Box>
    </Box>
  );
};

// Feedback detail component
const FeedbackDetail = () => {
  const record = useRecordContext();
  const refresh = useRefresh();
  const translate = useTranslate();
  const { formatDateTime } = useTimezone();

  if (!record) return null;

  const deviceInfo = record.deviceInfo as {
    model?: string;
    systemVersion?: string;
    appVersion?: string;
    language?: string;
  } | null;

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
                  feedbackId={String(record.id)}
                  currentStatus={record.status}
                  onSuccess={refresh}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {translate('resources.guestFeedback.fields.deviceId')}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                <PhoneIphoneIcon fontSize="small" color="action" />
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {record.deviceId}
                </Typography>
              </Box>
              {deviceInfo && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary" component="div">
                    {deviceInfo.model}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="div">
                    {deviceInfo.systemVersion}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="div">
                    App {deviceInfo.appVersion}
                  </Typography>
                  {deviceInfo.language && (
                    <Typography variant="caption" color="text.secondary" component="div">
                      {translate('resources.guestFeedback.fields.language')}: {deviceInfo.language}
                    </Typography>
                  )}
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                {translate('resources.guestFeedback.fields.created')}: {formatDateTime(record.createdAt)}
              </Typography>
              {record.repliedAt && (
                <Typography variant="body2" color="text.secondary">
                  {translate('resources.guestFeedback.fields.repliedAt')}: {formatDateTime(record.repliedAt)}
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* User Message */}
      <Card sx={{ mb: 2 }}>
        <CardHeader title={translate('resources.guestFeedback.userMessage')} />
        <Divider />
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              <PhoneIphoneIcon />
            </Avatar>
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2, flex: 1 }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {record.content}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1 }}
              >
                {formatDateTime(record.createdAt)}
              </Typography>
            </Paper>
          </Box>
        </CardContent>
      </Card>

      {/* Admin Reply (if exists) */}
      {record.adminReply && (
        <Card sx={{ mb: 2 }}>
          <CardHeader title={translate('resources.guestFeedback.adminReply')} />
          <Divider />
          <CardContent>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'success.main', width: 36, height: 36 }}>
                <SupportAgentIcon />
              </Avatar>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2, flex: 1 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {record.adminReply}
                </Typography>
                {record.repliedAt && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1 }}
                  >
                    {formatDateTime(record.repliedAt)}
                  </Typography>
                )}
              </Paper>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Reply form */}
      <Card>
        <ReplyForm
          feedbackId={String(record.id)}
          existingReply={record.adminReply}
          onSuccess={refresh}
        />
      </Card>
    </Box>
  );
};

// Show actions
const ShowActions = () => {
  const translate = useTranslate();
  return (
    <TopToolbar sx={{ justifyContent: 'flex-start' }}>
      <ListButton label={translate('resources.guestFeedback.backToList')} icon={<ArrowBackIcon />} />
    </TopToolbar>
  );
};

// Debug wrapper for show context
const FeedbackShowDebugWrapper = ({ children }: { children: React.ReactNode }) => {
  const record = useRecordContext();

  useEffect(() => {
    debugLog('GuestFeedbackShow', 'record context state', {
      hasRecord: !!record,
      recordId: record?.id,
      recordType: record?.type,
      recordStatus: record?.status,
    });

    if (record) {
      debugLog('GuestFeedbackShow', 'record details', {
        id: record.id,
        type: record.type,
        status: record.status,
        subject: record.subject,
        deviceId: record.deviceId,
        hasAdminReply: !!record.adminReply,
      });
    }
  }, [record]);

  return <>{children}</>;
};

// Guest Feedback show
export const GuestFeedbackShow = () => {
  debugLog('GuestFeedbackShow', 'component rendering');

  return (
    <DebugErrorBoundary componentName="GuestFeedbackShow">
      <Show actions={<ShowActions />} resource="guest-feedback">
        <SimpleShowLayout>
          <FeedbackShowDebugWrapper>
            <FeedbackDetail />
          </FeedbackShowDebugWrapper>
        </SimpleShowLayout>
      </Show>
    </DebugErrorBoundary>
  );
};
