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
  IconButton,
  Paper,
  Skeleton,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import RateReviewIcon from '@mui/icons-material/RateReview';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTranslate } from 'react-admin';
import { useEnvironment } from '../../contexts/EnvironmentContext';

type PipelineEnvironment = 'local' | 'debugging' | 'staging' | 'production';

interface BooklistInfo {
  path: string;
  name: string;
  bookCount: number;
  sections: string[];
  modifiedAt?: string;
}

interface PipelineRun {
  runId: string;
  environment: string;
  executor: 'local' | 'droplet';
  status: 'submitted' | 'running' | 'completed' | 'failed' | 'not_found';
  logFile?: string;
  logTail?: string;
  submittedAt: Date;
  error?: string;
  progress?: {
    completed: number;
    total: number;
    percentage: number;
    skipped?: number;
    failed?: number;
  };
  stage?: string;
  startTime?: Date;
  elapsedSeconds?: number;
  currentBook?: { title: string; author: string };
}

interface HistoryItem {
  id: string;
  source: string;
  environment: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  totalBooks: number;
  processedBooks: number;
  successBooks: number;
  failedBooks: number;
  skippedBooks: number;
  notes?: string;
}

const environmentOptions: { value: PipelineEnvironment; label: string; color: string }[] = [
  { value: 'local', label: 'Local (本机)', color: '#4caf50' },
  { value: 'debugging', label: 'Debugging (测试)', color: '#2196f3' },
  { value: 'staging', label: 'Staging (预发布)', color: '#ff9800' },
  { value: 'production', label: 'Production (正式)', color: '#f44336' },
];

export function PipelineDashboard() {
  const translate = useTranslate();
  const { apiBaseUrl } = useEnvironment();

  // Form state
  const [selectedEnvironment, setSelectedEnvironment] = useState<PipelineEnvironment | null>(null);
  const [selectedBooklist, setSelectedBooklist] = useState<string | null>(null);

  // Booklist state
  const [booklists, setBooklists] = useState<BooklistInfo[]>([]);
  const [booklistsLoading, setBooklistsLoading] = useState(true);

  // Pipeline execution state - restore from localStorage
  const [currentRun, setCurrentRun] = useState<PipelineRun | null>(() => {
    const saved = localStorage.getItem('pipeline_current_run');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, submittedAt: new Date(parsed.submittedAt) };
      } catch {
        return null;
      }
    }
    return null;
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitted, setSubmitted] = useState(() => {
    return localStorage.getItem('pipeline_current_run') !== null;
  });
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Confirmation dialogs
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // History from API
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Pending review count
  const [pendingReviewCount, setPendingReviewCount] = useState<number>(0);

  // Save currentRun to localStorage when it changes
  useEffect(() => {
    if (currentRun) {
      localStorage.setItem('pipeline_current_run', JSON.stringify(currentRun));
    }
  }, [currentRun]);

  // Fetch booklists on mount
  useEffect(() => {
    const fetchBooklists = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiBaseUrl}/api/v1/admin/pipeline/booklists`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Admin-Mode': 'true',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBooklists(data);
        }
      } catch (err) {
        console.error('Failed to fetch booklists:', err);
      } finally {
        setBooklistsLoading(false);
      }
    };

    fetchBooklists();
  }, [apiBaseUrl]);

  // Fetch history
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/v1/admin/pipeline/history?limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Admin-Mode': 'true',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Fetch pending review count
  const fetchPendingReviewCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${apiBaseUrl}/api/v1/content-studio/books?contentStatus=PENDING&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Admin-Mode': 'true',
            'x-studio-environment': 'LOCAL',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPendingReviewCount(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch pending review count:', err);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchPendingReviewCount();
  }, [fetchPendingReviewCount]);

  // Refresh pending count when pipeline completes
  useEffect(() => {
    if (currentRun?.status === 'completed') {
      fetchPendingReviewCount();
    }
  }, [currentRun?.status, fetchPendingReviewCount]);

  const openContentStudio = () => {
    window.open('http://localhost:3002', '_blank');
  };

  // Auto-refresh status on mount if there's a saved run
  useEffect(() => {
    if (currentRun && submitted) {
      refreshStatus();
    }
  }, []);

  // Get selected booklist info
  const selectedBooklistInfo = booklists.find((b) => b.path === selectedBooklist);

  const handleSubmit = async () => {
    if (!selectedEnvironment) return;

    // Show confirmation for production
    if (selectedEnvironment === 'production') {
      setConfirmOpen(true);
      return;
    }

    await submitPipeline();
  };

  const submitPipeline = async () => {
    setConfirmOpen(false);
    setSubmitLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/v1/admin/pipeline/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Admin-Mode': 'true',
        },
        body: JSON.stringify({
          environment: selectedEnvironment,
          booklistId: selectedBooklist || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit pipeline');
      }

      const data = await response.json();
      const newRun: PipelineRun = {
        runId: data.runId,
        environment: data.environment,
        executor: data.executor,
        status: data.status === 'submitted' ? 'running' : data.status,
        logFile: data.logFile,
        submittedAt: new Date(data.submittedAt),
        error: data.error,
      };

      setCurrentRun(newRun);
      setSubmitted(true);
      // Reset config
      setSelectedEnvironment(null);
      setSelectedBooklist(null);
      // Refresh history
      fetchHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleNewTask = () => {
    setSubmitted(false);
    setCurrentRun(null);
    setSelectedEnvironment(null);
    setSelectedBooklist(null);
    setError(null);
    localStorage.removeItem('pipeline_current_run');
  };

  const handleDeleteTask = () => {
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteTask = () => {
    setDeleteConfirmOpen(false);
    localStorage.removeItem('pipeline_current_run');
    setCurrentRun(null);
    setSubmitted(false);
    setError(null);
  };

  const refreshStatus = useCallback(async () => {
    if (!currentRun) return;

    setRefreshLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${apiBaseUrl}/api/v1/admin/pipeline/run/${currentRun.runId}/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Admin-Mode': 'true',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCurrentRun((prev) => {
          if (!prev) return null;

          // Lock elapsedSeconds when task is completed or failed
          const isTaskEnded = prev.status === 'completed' || prev.status === 'failed';
          const shouldLockElapsed = isTaskEnded && prev.elapsedSeconds !== undefined;

          return {
            ...prev,
            status: data.status,
            logTail: data.logTail,
            progress: data.progress,
            stage: data.stage,
            startTime: data.startTime ? new Date(data.startTime) : prev.startTime,
            elapsedSeconds: shouldLockElapsed ? prev.elapsedSeconds : data.elapsedSeconds,
            currentBook: data.currentBook,
          };
        });
      }
    } catch (err) {
      console.error('Failed to refresh status:', err);
    } finally {
      setRefreshLoading(false);
    }
  }, [apiBaseUrl, currentRun]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      case 'running':
      case 'submitted':
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
      case 'submitted':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleResume = async (batchId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/v1/admin/pipeline/resume/${batchId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Admin-Mode': 'true',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resume pipeline');
      }

      const data = await response.json();
      const newRun: PipelineRun = {
        runId: data.id,
        environment: data.environment || 'local',
        executor: 'local',
        status: 'running',
        submittedAt: new Date(data.createdAt),
      };

      setCurrentRun(newRun);
      setSubmitted(true);
      fetchHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resume failed');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {translate('pipeline.title', { _: 'Pipeline 任务提交' })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          选择目标环境，提交批处理任务（书籍导入、作者信息、BookContext、金句、Discover）
        </Typography>
      </Box>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Submit Form - Only show when not submitted */}
      {!submitted && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              提交新任务
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Environment selector */}
              <FormControl sx={{ minWidth: 300 }}>
                <InputLabel>目标环境</InputLabel>
                <Select
                  value={selectedEnvironment || ''}
                  label="目标环境"
                  onChange={(e) => setSelectedEnvironment(e.target.value as PipelineEnvironment)}
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

              {/* Booklist selector */}
              <Box>
                {booklistsLoading ? (
                  <Skeleton variant="rectangular" width={300} height={56} sx={{ borderRadius: 1 }} />
                ) : (
                  <FormControl sx={{ minWidth: 300 }}>
                    <InputLabel>选择书单</InputLabel>
                    <Select
                      value={selectedBooklist || ''}
                      label="选择书单"
                      onChange={(e) => setSelectedBooklist(e.target.value || null)}
                    >
                      <MenuItem value="">
                        <em>不选择（使用默认）</em>
                      </MenuItem>
                      {booklists.map((bl) => (
                        <MenuItem key={bl.path} value={bl.path}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{bl.path}</span>
                            <Chip label={`${bl.bookCount}本`} size="small" variant="outlined" />
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {selectedBooklistInfo && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {selectedBooklistInfo.bookCount} 本书 | {selectedBooklistInfo.sections.length} 个分类
                  </Typography>
                )}
              </Box>

              {/* Submit button */}
              <Box>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={!selectedEnvironment || submitLoading}
                  startIcon={submitLoading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                >
                  {submitLoading ? '提交中...' : translate('pipeline.startPipeline', { _: '开始导入' })}
                </Button>
              </Box>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              任务提交后将在后台运行（本地用 nohup，远程用 Droplet PM2）
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Current Run Status - Only show after submitted */}
      {submitted && currentRun && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">当前任务状态</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={refreshStatus}
                  disabled={refreshLoading}
                  startIcon={<RefreshIcon sx={{ animation: refreshLoading ? 'spin 1s linear infinite' : 'none' }} />}
                >
                  刷新
                </Button>
                <Button variant="outlined" size="small" onClick={handleNewTask}>
                  新建任务
                </Button>
                <Button variant="outlined" size="small" color="error" onClick={handleDeleteTask}>
                  删除记录
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              {getStatusIcon(currentRun.status)}
              <Chip
                label={currentRun.status.toUpperCase()}
                color={getStatusColor(currentRun.status)}
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                {currentRun.environment} · {currentRun.executor}
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Run ID:</strong> {currentRun.runId}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>提交时间:</strong> {currentRun.submittedAt.toLocaleString()}
            </Typography>
            {currentRun.logFile && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>日志:</strong> <code>{currentRun.logFile}</code>
              </Typography>
            )}
            {currentRun.stage && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>当前阶段:</strong> {currentRun.stage}
              </Typography>
            )}
            {currentRun.elapsedSeconds !== undefined && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>已用时间:</strong> {Math.floor(currentRun.elapsedSeconds / 60)}分{currentRun.elapsedSeconds % 60}秒
              </Typography>
            )}
            {currentRun.currentBook && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>正在处理:</strong> "{currentRun.currentBook.title}" by {currentRun.currentBook.author}
              </Typography>
            )}
            {currentRun.progress && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>进度:</strong> {currentRun.progress.completed + (currentRun.progress.skipped || 0) + (currentRun.progress.failed || 0)}/{currentRun.progress.total} ({currentRun.progress.percentage}%)
                </Typography>
                <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8, mb: 1 }}>
                  <Box
                    sx={{
                      width: `${currentRun.progress.percentage}%`,
                      bgcolor: currentRun.status === 'completed' ? 'success.main' : 'primary.main',
                      borderRadius: 1,
                      height: '100%',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip label={`完成: ${currentRun.progress.completed}`} size="small" color="success" variant="outlined" />
                  {currentRun.progress.skipped !== undefined && currentRun.progress.skipped > 0 && (
                    <Chip label={`跳过: ${currentRun.progress.skipped}`} size="small" color="warning" variant="outlined" />
                  )}
                  {currentRun.progress.failed !== undefined && currentRun.progress.failed > 0 && (
                    <Chip label={`失败: ${currentRun.progress.failed}`} size="small" color="error" variant="outlined" />
                  )}
                </Box>
              </Box>
            )}

            {currentRun.logTail && (
              <Paper
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  maxHeight: 200,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {currentRun.logTail}
              </Paper>
            )}

            {currentRun.error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {currentRun.error}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content Studio Review Notice */}
      {pendingReviewCount > 0 && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          icon={<RateReviewIcon />}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={openContentStudio}
              startIcon={<OpenInNewIcon />}
            >
              打开 Content Studio
            </Button>
          }
        >
          <Typography variant="body2">
            有 <strong>{pendingReviewCount}</strong> 本书等待内容审核
          </Typography>
        </Alert>
      )}

      {/* Show Content Studio link when pipeline completes */}
      {currentRun?.status === 'completed' && (
        <Card sx={{ mb: 3, bgcolor: 'success.light' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon sx={{ color: 'success.dark', fontSize: 32 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                  Pipeline 执行完成
                </Typography>
                <Typography variant="body2" sx={{ color: 'success.dark' }}>
                  书籍已导入，请前往 Content Studio 进行内容审核
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              color="success"
              onClick={openContentStudio}
              startIcon={<RateReviewIcon />}
              endIcon={<OpenInNewIcon />}
            >
              开始审核
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Task History */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">任务历史</Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={fetchHistory}
              disabled={historyLoading}
              startIcon={<RefreshIcon sx={{ animation: historyLoading ? 'spin 1s linear infinite' : 'none' }} />}
            >
              刷新
            </Button>
          </Box>

          {historyLoading && history.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Skeleton variant="rectangular" height={48} />
              <Skeleton variant="rectangular" height={48} />
              <Skeleton variant="rectangular" height={48} />
            </Box>
          ) : history.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              暂无任务记录
            </Typography>
          ) : (
            history.map((item) => (
              <Box
                key={item.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.5,
                  px: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
                  '&:hover': { bgcolor: 'action.hover' },
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  {item.status === 'COMPLETED' && <CheckCircleIcon sx={{ color: 'success.main' }} />}
                  {item.status === 'FAILED' && <ErrorIcon sx={{ color: 'error.main' }} />}
                  {item.status === 'RUNNING' && <HourglassEmptyIcon sx={{ color: 'warning.main' }} />}
                  {item.status === 'PENDING' && <HourglassEmptyIcon sx={{ color: 'grey.500' }} />}

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip
                        label={item.environment}
                        size="small"
                        sx={{
                          bgcolor: environmentOptions.find((e) => e.value === item.environment)?.color || 'grey.500',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                        }}
                      />
                      <Chip
                        label={item.status}
                        size="small"
                        color={
                          item.status === 'COMPLETED' ? 'success' :
                          item.status === 'FAILED' ? 'error' :
                          item.status === 'RUNNING' ? 'warning' : 'default'
                        }
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {item.successBooks}/{item.totalBooks} 成功
                      {item.skippedBooks > 0 && ` · ${item.skippedBooks} 跳过`}
                      {item.failedBooks > 0 && ` · ${item.failedBooks} 失败`}
                      {' · '}
                      {new Date(item.startedAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                {item.status === 'FAILED' && item.failedBooks > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleResume(item.id)}
                  >
                    继续 ({item.failedBooks})
                  </Button>
                )}
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      {/* Production confirmation dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>确认提交到生产环境</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您即将向 <strong>PRODUCTION</strong> 环境提交批处理任务。
            这将影响线上数据，确定要继续吗？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>取消</Button>
          <Button onClick={submitPipeline} color="error" variant="contained">
            确认提交
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete task confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            删除将清除当前任务的本地记录（不会停止实际运行中的后台任务），确定要继续吗？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>取消</Button>
          <Button onClick={confirmDeleteTask} color="error" variant="contained">
            确认删除
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
