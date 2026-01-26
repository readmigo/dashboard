import {
  Show,
  useRecordContext,
  useDataProvider,
  useRefresh,
  useNotify,
  useTranslate,
} from 'react-admin';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Divider,
  TextField as MuiTextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Avatar,
  Tooltip,
} from '@mui/material';
import { useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LockIcon from '@mui/icons-material/Lock';

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  NEW: 'info',
  ASSIGNED: 'primary',
  IN_PROGRESS: 'warning',
  AWAITING_USER: 'secondary',
  RESOLVED: 'success',
  CLOSED: 'default',
  REOPENED: 'error',
};

const priorityColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  LOW: 'default',
  NORMAL: 'primary',
  HIGH: 'warning',
  URGENT: 'error',
};

interface Message {
  id: string;
  senderId: string;
  senderType: 'USER' | 'AGENT' | 'SYSTEM';
  content: string;
  isInternal: boolean;
  createdAt: string;
}

interface TicketRecord {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  source: string;
  userId: string;
  user?: { name?: string; email?: string };
  assignedTo?: string;
  tags?: string[];
  messages?: Message[];
  history?: Array<{
    id: string;
    action: string;
    oldValue?: string;
    newValue?: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const ConversationPanel = () => {
  const record = useRecordContext<TicketRecord>();
  const dataProvider = useDataProvider();
  const refresh = useRefresh();
  const notify = useNotify();
  const translate = useTranslate();
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!record) return null;

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await dataProvider.create(`admin/tickets/${record.id}/messages`, {
        data: {
          content: newMessage,
          isInternal,
        },
      });
      setNewMessage('');
      refresh();
      notify(translate('resources.tickets.notifications.messageSent'), { type: 'success' });
    } catch (error) {
      notify(translate('resources.tickets.notifications.messageFailed'), { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {translate('resources.tickets.conversation')}
        </Typography>
        <Box sx={{ maxHeight: 400, overflowY: 'auto', mb: 2 }}>
          {record.messages?.map((message) => (
            <Paper
              key={message.id}
              sx={{
                p: 2,
                mb: 1,
                ml: message.senderType === 'USER' ? 0 : 4,
                mr: message.senderType === 'USER' ? 4 : 0,
                bgcolor: message.isInternal
                  ? 'grey.100'
                  : message.senderType === 'USER'
                  ? 'primary.50'
                  : 'secondary.50',
                borderLeft: message.isInternal ? '4px solid orange' : 'none',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                  {message.senderType === 'USER' ? (
                    <PersonIcon fontSize="small" />
                  ) : (
                    <SupportAgentIcon fontSize="small" />
                  )}
                </Avatar>
                <Typography variant="caption" color="textSecondary">
                  {message.senderType === 'USER' ? translate('resources.tickets.senderType.USER') : translate('resources.tickets.senderType.AGENT')}
                  {message.isInternal && (
                    <Chip
                      icon={<LockIcon fontSize="small" />}
                      label={translate('resources.tickets.internal')}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ ml: 'auto' }}>
                  {new Date(message.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {message.content}
              </Typography>
            </Paper>
          ))}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <MuiTextField
            fullWidth
            multiline
            rows={3}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={translate('resources.tickets.replyPlaceholder')}
            disabled={loading || record.status === 'CLOSED'}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Tooltip title={translate('resources.tickets.internalNoteTooltip')}>
              <Chip
                label={translate('resources.tickets.internal')}
                icon={<LockIcon fontSize="small" />}
                onClick={() => setIsInternal(!isInternal)}
                color={isInternal ? 'warning' : 'default'}
                variant={isInternal ? 'filled' : 'outlined'}
                size="small"
              />
            </Tooltip>
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSend}
              disabled={loading || !newMessage.trim() || record.status === 'CLOSED'}
            >
              {translate('resources.tickets.send')}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const TicketActions = () => {
  const record = useRecordContext<TicketRecord>();
  const dataProvider = useDataProvider();
  const refresh = useRefresh();
  const notify = useNotify();
  const translate = useTranslate();
  const [loading, setLoading] = useState(false);

  if (!record) return null;

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      await dataProvider.update('admin/tickets', {
        id: record.id,
        data: { status: newStatus },
        previousData: record,
      });
      refresh();
      notify(translate('resources.tickets.notifications.statusUpdated'), { type: 'success' });
    } catch (error) {
      notify(translate('resources.tickets.notifications.statusUpdateFailed'), { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    setLoading(true);
    try {
      await dataProvider.update('admin/tickets', {
        id: record.id,
        data: { priority: newPriority },
        previousData: record,
      });
      refresh();
      notify(translate('resources.tickets.notifications.priorityUpdated'), { type: 'success' });
    } catch (error) {
      notify(translate('resources.tickets.notifications.priorityUpdateFailed'), { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {translate('resources.tickets.actions')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>{translate('resources.tickets.fields.status')}</InputLabel>
              <Select
                value={record.status}
                label={translate('resources.tickets.fields.status')}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="NEW">{translate('resources.tickets.status.NEW')}</MenuItem>
                <MenuItem value="ASSIGNED">{translate('resources.tickets.status.ASSIGNED')}</MenuItem>
                <MenuItem value="IN_PROGRESS">{translate('resources.tickets.status.IN_PROGRESS')}</MenuItem>
                <MenuItem value="AWAITING_USER">{translate('resources.tickets.status.AWAITING_USER')}</MenuItem>
                <MenuItem value="RESOLVED">{translate('resources.tickets.status.RESOLVED')}</MenuItem>
                <MenuItem value="CLOSED">{translate('resources.tickets.status.CLOSED')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>{translate('resources.tickets.fields.priority')}</InputLabel>
              <Select
                value={record.priority}
                label={translate('resources.tickets.fields.priority')}
                onChange={(e) => handlePriorityChange(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="LOW">{translate('resources.tickets.priority.LOW')}</MenuItem>
                <MenuItem value="NORMAL">{translate('resources.tickets.priority.NORMAL')}</MenuItem>
                <MenuItem value="HIGH">{translate('resources.tickets.priority.HIGH')}</MenuItem>
                <MenuItem value="URGENT">{translate('resources.tickets.priority.URGENT')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const TicketDetails = () => {
  const record = useRecordContext<TicketRecord>();
  const translate = useTranslate();

  if (!record) return null;

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5">{record.subject}</Typography>
            <Typography variant="caption" color="textSecondary">
              #{record.ticketNumber}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={translate(`resources.tickets.status.${record.status}`)}
                color={statusColors[record.status] || 'default'}
              />
              <Chip
                label={translate(`resources.tickets.priority.${record.priority}`)}
                color={priorityColors[record.priority] || 'default'}
                variant="outlined"
              />
              <Chip label={record.source} variant="outlined" />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              {translate('resources.tickets.fields.user')}
            </Typography>
            <Typography>{record.user?.name || record.user?.email || '-'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              {translate('resources.tickets.fields.createdAt')}
            </Typography>
            <Typography>{new Date(record.createdAt).toLocaleString()}</Typography>
          </Grid>
          {record.tags && record.tags.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                {translate('resources.tickets.fields.tags')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                {record.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

const TicketHistory = () => {
  const record = useRecordContext<TicketRecord>();
  const translate = useTranslate();

  if (!record?.history?.length) return null;

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {translate('resources.tickets.history')}
        </Typography>
        <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
          {record.history.map((entry) => (
            <Box key={entry.id} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>{entry.action}</strong>
                {entry.oldValue && entry.newValue && (
                  <>: {entry.oldValue} → {entry.newValue}</>
                )}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {new Date(entry.createdAt).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export const TicketShow = () => {
  return (
    <Show>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <TicketDetails />
            <ConversationPanel />
          </Grid>
          <Grid item xs={4}>
            <TicketActions />
            <TicketHistory />
          </Grid>
        </Grid>
      </Box>
    </Show>
  );
};
