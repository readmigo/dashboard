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
  Rating,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AttachFileIcon from '@mui/icons-material/AttachFile';

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

interface FeedbackRecord {
  id: string;
  userId: string;
  user?: { name?: string; email?: string };
  category: string;
  status: string;
  rating?: number;
  content: string;
  appVersion?: string;
  deviceModel?: string;
  osVersion?: string;
  adminNotes?: string;
  convertedToTicketId?: string;
  attachments?: Array<{
    id: string;
    type: string;
    url: string;
    fileName?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const FeedbackDetails = () => {
  const record = useRecordContext<FeedbackRecord>();
  const translate = useTranslate();

  if (!record) return null;

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
              <Chip
                label={translate(`resources.feedback.category.${record.category}`)}
                color={categoryColors[record.category] || 'default'}
              />
              <Chip
                label={translate(`resources.feedback.status.${record.status}`)}
                color={statusColors[record.status] || 'default'}
              />
              {record.rating !== null && record.rating !== undefined && (
                <Rating value={record.rating} readOnly />
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {translate('resources.feedback.fields.content')}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              {record.content}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {translate('resources.feedback.deviceInfo')}
            </Typography>
            <List dense>
              {record.appVersion && (
                <ListItem>
                  <ListItemIcon><PhoneAndroidIcon /></ListItemIcon>
                  <ListItemText primary={translate('resources.feedback.fields.appVersion')} secondary={record.appVersion} />
                </ListItem>
              )}
              {record.deviceModel && (
                <ListItem>
                  <ListItemIcon><PhoneAndroidIcon /></ListItemIcon>
                  <ListItemText primary={translate('resources.feedback.fields.device')} secondary={record.deviceModel} />
                </ListItem>
              )}
              {record.osVersion && (
                <ListItem>
                  <ListItemIcon><PhoneAndroidIcon /></ListItemIcon>
                  <ListItemText primary={translate('resources.feedback.fields.osVersion')} secondary={record.osVersion} />
                </ListItem>
              )}
            </List>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary">
              {translate('resources.feedback.fields.user')}
            </Typography>
            <Typography>{record.user?.name || record.user?.email || '-'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary">
              {translate('resources.feedback.fields.createdAt')}
            </Typography>
            <Typography>{new Date(record.createdAt).toLocaleString()}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const FeedbackActions = () => {
  const record = useRecordContext<FeedbackRecord>();
  const dataProvider = useDataProvider();
  const refresh = useRefresh();
  const notify = useNotify();
  const translate = useTranslate();
  const navigate = useNavigate();
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!record) return null;

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      await dataProvider.update('admin/feedback', {
        id: record.id,
        data: { status: newStatus },
        previousData: record,
      });
      refresh();
      notify(translate('resources.feedback.notifications.statusUpdated'), { type: 'success' });
    } catch (error) {
      notify(translate('resources.feedback.notifications.statusUpdateError'), { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    setLoading(true);
    try {
      await dataProvider.update('admin/feedback', {
        id: record.id,
        data: { adminNotes },
        previousData: record,
      });
      refresh();
      notify(translate('resources.feedback.notifications.notesSaved'), { type: 'success' });
    } catch (error) {
      notify(translate('resources.feedback.notifications.notesSaveError'), { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToTicket = async () => {
    setLoading(true);
    try {
      const response = await dataProvider.create(`admin/feedback/${record.id}/convert-to-ticket`, {
        data: {},
      });
      notify(translate('resources.feedback.notifications.convertedToTicket'), { type: 'success' });
      navigate(`/admin/tickets/${response.data.ticketId}/show`);
    } catch (error) {
      notify(translate('resources.feedback.notifications.convertToTicketError'), { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {translate('resources.feedback.actions')}
        </Typography>
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>{translate('resources.feedback.fields.status')}</InputLabel>
            <Select
              value={record.status}
              label={translate('resources.feedback.fields.status')}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="NEW">{translate('resources.feedback.status.NEW')}</MenuItem>
              <MenuItem value="ACKNOWLEDGED">{translate('resources.feedback.status.ACKNOWLEDGED')}</MenuItem>
              <MenuItem value="UNDER_REVIEW">{translate('resources.feedback.status.UNDER_REVIEW')}</MenuItem>
              <MenuItem value="PLANNED">{translate('resources.feedback.status.PLANNED')}</MenuItem>
              <MenuItem value="IN_PROGRESS">{translate('resources.feedback.status.IN_PROGRESS')}</MenuItem>
              <MenuItem value="COMPLETED">{translate('resources.feedback.status.COMPLETED')}</MenuItem>
              <MenuItem value="WONT_FIX">{translate('resources.feedback.status.WONT_FIX')}</MenuItem>
              <MenuItem value="DUPLICATE">{translate('resources.feedback.status.DUPLICATE')}</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ mb: 2 }}>
          <MuiTextField
            fullWidth
            multiline
            rows={3}
            label={translate('resources.feedback.fields.adminNotes')}
            value={adminNotes || record.adminNotes || ''}
            onChange={(e) => setAdminNotes(e.target.value)}
            disabled={loading}
          />
          <Button
            size="small"
            onClick={handleSaveNotes}
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {translate('ra.action.save')}
          </Button>
        </Box>
        <Divider sx={{ my: 2 }} />
        {!record.convertedToTicketId ? (
          <Button
            variant="contained"
            startIcon={<ConfirmationNumberIcon />}
            onClick={handleConvertToTicket}
            disabled={loading}
            fullWidth
          >
            {translate('resources.feedback.convertToTicket')}
          </Button>
        ) : (
          <Button
            variant="outlined"
            startIcon={<ConfirmationNumberIcon />}
            onClick={() => navigate(`/admin/tickets/${record.convertedToTicketId}/show`)}
            fullWidth
          >
            {translate('resources.feedback.viewTicket')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const FeedbackAttachments = () => {
  const record = useRecordContext<FeedbackRecord>();
  const translate = useTranslate();

  if (!record?.attachments?.length) return null;

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {translate('resources.feedback.attachments')}
        </Typography>
        <List dense>
          {record.attachments.map((attachment) => (
            <ListItem
              key={attachment.id}
              component="a"
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ListItemIcon>
                <AttachFileIcon />
              </ListItemIcon>
              <ListItemText
                primary={attachment.fileName || translate('resources.feedback.attachment')}
                secondary={attachment.type}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export const FeedbackShow = () => {
  return (
    <Show>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <FeedbackDetails />
            <FeedbackAttachments />
          </Grid>
          <Grid item xs={4}>
            <FeedbackActions />
          </Grid>
        </Grid>
      </Box>
    </Show>
  );
};
