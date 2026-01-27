import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Paper,
  LinearProgress,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { useTranslate } from 'react-admin';
import { useEnvironment } from '../../contexts/EnvironmentContext';

type SEEnvironment = 'local' | 'production';

interface NodeProgress {
  total: number;
  processed: number;
  status: string;
}

interface SEImportStatus {
  runId: string;
  currentNode: number;
  currentNodeName: string;
  status: 'running' | 'completed' | 'failed';
  progress: {
    node1: NodeProgress;
    node2: NodeProgress;
    node3: NodeProgress;
    node4: NodeProgress;
  };
  error?: string;
  startTime: string;
  endTime?: string;
}

interface SEImportRun {
  runId: string;
  environment: SEEnvironment;
  status: 'started' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  error?: string;
  importStatus?: SEImportStatus;
}

export function SEIncrementalImport() {
  const { apiBaseUrl } = useEnvironment();
  const translate = useTranslate();

  const environmentOptions: { value: SEEnvironment; label: string; color: string }[] = [
    { value: 'local', label: translate('seImport.environments.local', { _: 'Local' }), color: '#4caf50' },
    { value: 'production', label: translate('seImport.environments.production', { _: 'Production' }), color: '#f44336' },
  ];

  const nodeNames: Record<number, string> = {
    1: translate('seImport.nodes.node1', { _: '增量计算' }),
    2: translate('seImport.nodes.node2', { _: '解析修正' }),
    3: translate('seImport.nodes.node3', { _: '数据填充' }),
    4: translate('seImport.nodes.node4', { _: 'Discover Tab' }),
  };

  // Form state
  const [selectedEnvironment, setSelectedEnvironment] = useState<SEEnvironment | null>(null);

  // Import execution state - restore from localStorage
  const [currentRun, setCurrentRun] = useState<SEImportRun | null>(() => {
    const saved = localStorage.getItem('se_import_current_run');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, startedAt: new Date(parsed.startedAt) };
      } catch {
        return null;
      }
    }
    return null;
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Confirmation dialog
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Save currentRun to localStorage when it changes
  useEffect(() => {
    if (currentRun) {
      localStorage.setItem('se_import_current_run', JSON.stringify(currentRun));
    }
  }, [currentRun]);

  // Auto-refresh status when there's an active run
  useEffect(() => {
    if (currentRun && (currentRun.status === 'started' || currentRun.status === 'running')) {
      const interval = setInterval(() => {
        refreshStatus();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [currentRun?.runId, currentRun?.status]);

  const handleSubmit = async () => {
    if (!selectedEnvironment) return;

    // Show confirmation for production
    if (selectedEnvironment === 'production') {
      setConfirmOpen(true);
      return;
    }

    await submitImport();
  };

  const submitImport = async () => {
    setConfirmOpen(false);
    setSubmitLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/v1/admin/pipeline/se-incremental`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Admin-Mode': 'true',
        },
        body: JSON.stringify({
          environment: selectedEnvironment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start SE import');
      }

      const data = await response.json();
      const newRun: SEImportRun = {
        runId: data.runId,
        environment: data.environment,
        status: data.status === 'started' ? 'running' : data.status,
        startedAt: new Date(data.startedAt),
        error: data.error,
      };

      setCurrentRun(newRun);
      setSelectedEnvironment(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const refreshStatus = useCallback(async () => {
    if (!currentRun) return;

    setRefreshLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${apiBaseUrl}/api/v1/admin/pipeline/se-incremental/${currentRun.runId}/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Admin-Mode': 'true',
          },
        }
      );

      if (response.ok) {
        const data: SEImportStatus = await response.json();
        setCurrentRun((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: data.status,
            error: data.error,
            importStatus: data,
          };
        });
      }
    } catch (err) {
      console.error('Failed to refresh status:', err);
    } finally {
      setRefreshLoading(false);
    }
  }, [apiBaseUrl, currentRun]);

  const handleNewImport = () => {
    setCurrentRun(null);
    setSelectedEnvironment(null);
    setError(null);
    localStorage.removeItem('se_import_current_run');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      case 'running':
      case 'started':
        return <HourglassEmptyIcon sx={{ color: 'warning.main' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'running':
      case 'started':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getNodeStatusColor = (status: string): 'success' | 'error' | 'warning' | 'info' | 'default' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'running':
        return 'warning';
      case 'pending':
        return 'default';
      default:
        return 'info';
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return translate('seImport.status.duration', { minutes, seconds: remainingSeconds, _: `${minutes}m ${remainingSeconds}s` });
  };

  const renderNodeProgress = (nodeNum: number, progress: NodeProgress) => {
    const percentage = progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0;
    const isActive = currentRun?.importStatus?.currentNode === nodeNum;

    return (
      <Box
        key={nodeNum}
        sx={{
          p: 2,
          mb: 1,
          borderRadius: 1,
          bgcolor: isActive ? 'action.selected' : 'background.paper',
          border: '1px solid',
          borderColor: isActive ? 'primary.main' : 'divider',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: isActive ? 'bold' : 'normal' }}>
              Node {nodeNum}: {nodeNames[nodeNum]}
            </Typography>
            {isActive && <CircularProgress size={16} />}
          </Box>
          <Chip
            label={progress.status.toUpperCase()}
            size="small"
            color={getNodeStatusColor(progress.status)}
            variant={isActive ? 'filled' : 'outlined'}
          />
        </Box>
        {progress.total > 0 && (
          <>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{ mb: 0.5, height: 6, borderRadius: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              {progress.processed} / {progress.total} ({percentage}%)
            </Typography>
          </>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <AutoStoriesIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4">{translate('seImport.title', { _: 'SE 增量导入' })}</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {translate('seImport.description', { _: '从 R2 raw-epubs/ 自动检测新增书籍，解析并导入到数据库' })}
        </Typography>
      </Box>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Submit Form - Only show when no active run */}
      {!currentRun && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {translate('seImport.startImport', { _: '开始导入' })}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Environment selector */}
              <FormControl sx={{ minWidth: 300 }}>
                <InputLabel>{translate('seImport.selectEnvironment', { _: '目标环境' })}</InputLabel>
                <Select
                  value={selectedEnvironment || ''}
                  label={translate('seImport.selectEnvironment', { _: '目标环境' })}
                  onChange={(e) => setSelectedEnvironment(e.target.value as SEEnvironment)}
                >
                  {environmentOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: opt.color,
                          }}
                        />
                        {opt.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Submit button */}
              <Box>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={!selectedEnvironment || submitLoading}
                  startIcon={submitLoading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                >
                  {submitLoading ? translate('seImport.submitting', { _: '提交中...' }) : translate('seImport.startImport', { _: '开始导入' })}
                </Button>
              </Box>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              {translate('seImport.pipelineFlow', { _: 'Pipeline 流程: 增量计算 → 解析修正 → 数据填充 → Discover Tab' })}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Current Run Status */}
      {currentRun && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{translate('seImport.status.title', { _: '导入状态' })}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={refreshStatus}
                  disabled={refreshLoading}
                  startIcon={
                    <RefreshIcon
                      sx={{ animation: refreshLoading ? 'spin 1s linear infinite' : 'none' }}
                    />
                  }
                >
                  {translate('seImport.status.refresh', { _: '刷新' })}
                </Button>
                {(currentRun.status === 'completed' || currentRun.status === 'failed') && (
                  <Button variant="outlined" size="small" onClick={handleNewImport}>
                    {translate('seImport.status.newImport', { _: '新建导入' })}
                  </Button>
                )}
              </Box>
            </Box>

            {/* Status overview */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              {getStatusIcon(currentRun.status)}
              <Chip
                label={currentRun.status.toUpperCase()}
                color={getStatusColor(currentRun.status)}
                size="small"
              />
              <Chip
                label={currentRun.environment}
                size="small"
                sx={{
                  bgcolor:
                    environmentOptions.find((e) => e.value === currentRun.environment)?.color ||
                    'grey.500',
                  color: 'white',
                }}
              />
            </Box>

            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>{translate('seImport.status.runId', { _: 'Run ID' })}:</strong> {currentRun.runId}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>{translate('seImport.status.startTime', { _: '开始时间' })}:</strong> {currentRun.startedAt.toLocaleString()}
            </Typography>
            {currentRun.importStatus && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>{translate('seImport.status.elapsed', { _: '已用时间' })}:</strong>{' '}
                {formatDuration(currentRun.importStatus.startTime, currentRun.importStatus.endTime)}
              </Typography>
            )}

            {/* Node progress */}
            {currentRun.importStatus && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {translate('seImport.status.progress', { _: '处理进度' })}
                </Typography>
                {renderNodeProgress(1, currentRun.importStatus.progress.node1)}
                {renderNodeProgress(2, currentRun.importStatus.progress.node2)}
                {renderNodeProgress(3, currentRun.importStatus.progress.node3)}
                {renderNodeProgress(4, currentRun.importStatus.progress.node4)}
              </Box>
            )}

            {/* Error display */}
            {currentRun.error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {currentRun.error}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Success message */}
      {currentRun?.status === 'completed' && (
        <Card sx={{ bgcolor: 'success.light' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
            <CheckCircleIcon sx={{ color: 'success.dark', fontSize: 32 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                {translate('seImport.status.completed', { _: 'SE 增量导入完成' })}
              </Typography>
              <Typography variant="body2" sx={{ color: 'success.dark' }}>
                {translate('seImport.status.completedDesc', { _: '新书籍已导入数据库并自动分类到 Discover Tab' })}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Info card */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom>
          {translate('seImport.nodeDescription.title', { _: 'Pipeline 节点说明' })}
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          <li>
            <Typography variant="body2">
              <strong>Node 1 - {translate('seImport.nodes.node1', { _: '增量计算' })}:</strong> {translate('seImport.nodeDescription.node1', { _: '比较 R2 raw-epubs/ 与 DB，找出新增书籍' })}
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Node 2 - {translate('seImport.nodes.node2', { _: '解析修正' })}:</strong> {translate('seImport.nodeDescription.node2', { _: '解析 EPUB，提取元数据、封面、章节内容 (CSS 保留)' })}
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Node 3 - {translate('seImport.nodes.node3', { _: '数据填充' })}:</strong> {translate('seImport.nodeDescription.node3', { _: '写入 DB (Author, Book, Chapter) + 上传封面到 R2' })}
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Node 4 - {translate('seImport.nodes.node4', { _: 'Discover Tab' })}:</strong> {translate('seImport.nodeDescription.node4', { _: '自动分类、书单关联、Featured 推荐' })}
            </Typography>
          </li>
        </Box>
      </Paper>

      {/* Production confirmation dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{translate('seImport.confirmDialog.title', { _: '确认提交到生产环境' })}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {translate('seImport.confirmDialog.message', { _: '您即将向 PRODUCTION 环境执行 SE 增量导入。这将直接写入线上数据库，确定要继续吗？' })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>{translate('seImport.confirmDialog.cancel', { _: '取消' })}</Button>
          <Button onClick={submitImport} color="error" variant="contained">
            {translate('seImport.confirmDialog.confirm', { _: '确认执行' })}
          </Button>
        </DialogActions>
      </Dialog>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
}
