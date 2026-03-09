import { useState, useEffect, useMemo } from 'react';
import { useTranslate } from 'react-admin';
import {
  Box, Card, CardContent, Typography, ToggleButtonGroup, ToggleButton,
  Grid, CircularProgress, Alert,
} from '@mui/material';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getApiUrl } from '../../config/environments';
import { getStoredEnvironment } from '../../contexts/EnvironmentContext';
import { brandColors } from '../../theme/brandTokens';

interface DailyReportRow {
  date: string;
  dau: number; dauIos: number; dauAndroid: number; dauWeb: number;
  newSignups: number;
  readingMinutes: number; readingSessions: number; avgMinutesPerUser: number;
  audiobookPlays: number; audiobookListeners: number; audiobookMinutes: number;
  ebookActiveUsers: number; audiobookActiveUsers: number; bothActiveUsers: number;
  ebookShare: number; audiobookShare: number;
  aiInteractions: number; aiCostUsd: number;
  paywallViews: number; purchases: number; conversionRate: number;
  sentryErrors: number; apiUptime: number; avgResponseMs: number;
  ampDau: number | null; dauDeviation: number | null;
}

type PredictionWindow = 30 | 90 | 180 | 365;

// Simple linear regression
function linearRegression(data: number[]): { slope: number; intercept: number } {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0] || 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope: isFinite(slope) ? slope : 0, intercept: isFinite(intercept) ? intercept : 0 };
}

function predict(data: number[], futureDays: number): number {
  const { slope, intercept } = linearRegression(data);
  const value = slope * (data.length + futureDays) + intercept;
  return Math.max(0, Math.round(value * 10) / 10);
}

function PredictionCard({ label, current, data, unit }: {
  label: string; current: number; data: number[]; unit?: string;
}) {
  const windows: PredictionWindow[] = [30, 90, 180, 365];
  const suffix = unit || '';

  if (data.length < 14) {
    return (
      <Card variant="outlined" sx={{ flex: 1, minWidth: 200 }}>
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
          <Typography variant="body2" color="text.secondary">Need 14+ days</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 200 }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{current}{suffix}</Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
          {windows.map(w => {
            const pred = predict(data, w);
            const diff = current > 0 ? ((pred - current) / current * 100).toFixed(0) : '0';
            return (
              <Typography key={w} variant="caption" sx={{ color: pred >= current ? 'success.main' : 'error.main' }}>
                {w}d: {pred}{suffix} ({diff}%)
              </Typography>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}

export function DailyReportPage() {
  const translate = useTranslate();
  const [data, setData] = useState<DailyReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(90);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const env = getStoredEnvironment();
        const apiUrl = getApiUrl(env);
        const res = await fetch(`${apiUrl}/api/v1/admin/operations/daily-reports?days=${days}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('adminToken')}`,
            'X-Admin-Mode': 'true',
          },
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [days]);

  // Prediction data arrays
  const dauArr = useMemo(() => data.map(d => d.dau), [data]);
  const readingArr = useMemo(() => data.map(d => d.readingMinutes), [data]);
  const audiobookShareArr = useMemo(() => data.map(d => d.audiobookShare), [data]);
  const conversionArr = useMemo(() => data.map(d => d.conversionRate), [data]);

  const latest = data[data.length - 1];

  // Generate prediction chart data
  const predictionWindow = 30;
  const chartDataWithPrediction = useMemo(() => {
    if (data.length < 14) return data;

    const { slope: dauSlope, intercept: dauInt } = linearRegression(dauArr);
    const { slope: readSlope, intercept: readInt } = linearRegression(readingArr);

    const predictions = [];
    for (let i = 1; i <= predictionWindow; i++) {
      const futureDate = new Date(data[data.length - 1].date);
      futureDate.setUTCDate(futureDate.getUTCDate() + i);
      predictions.push({
        date: futureDate.toISOString().split('T')[0],
        dauPredicted: Math.max(0, Math.round(dauSlope * (data.length + i) + dauInt)),
        readingPredicted: Math.max(0, Math.round(readSlope * (data.length + i) + readInt)),
      });
    }

    return [
      ...data.map(d => ({ ...d, dauPredicted: undefined, readingPredicted: undefined })),
      ...predictions,
    ];
  }, [data, dauArr, readingArr]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  if (data.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No daily report data yet. Reports are generated daily by GitHub Actions.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {translate('sidebar.operations.dailyReport', { _: 'Daily Report Trends' })}
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={days}
          exclusive
          onChange={(_, v) => v && setDays(v)}
          size="small"
        >
          <ToggleButton value={30}>30D</ToggleButton>
          <ToggleButton value={60}>60D</ToggleButton>
          <ToggleButton value={90}>90D</ToggleButton>
          <ToggleButton value={180}>180D</ToggleButton>
          <ToggleButton value={365}>1Y</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Prediction Cards */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <PredictionCard label="DAU" current={latest?.dau ?? 0} data={dauArr} />
        <PredictionCard label="Reading (min/day)" current={latest?.readingMinutes ?? 0} data={readingArr} unit="min" />
        <PredictionCard label="Audiobook Share" current={latest?.audiobookShare ?? 0} data={audiobookShareArr} unit="%" />
        <PredictionCard label="Conversion Rate" current={latest?.conversionRate ?? 0} data={conversionArr} unit="%" />
      </Box>

      <Grid container spacing={2}>
        {/* DAU Trend with Prediction */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>DAU Trend</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartDataWithPrediction}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="dau" stroke={brandColors.primary} strokeWidth={2} dot={false} name="DAU" />
                  <Line type="monotone" dataKey="dauIos" stroke="#34d399" strokeWidth={1} dot={false} name="iOS" />
                  <Line type="monotone" dataKey="dauAndroid" stroke="#60a5fa" strokeWidth={1} dot={false} name="Android" />
                  <Line type="monotone" dataKey="dauWeb" stroke="#fbbf24" strokeWidth={1} dot={false} name="Web" />
                  <Line type="monotone" dataKey="dauPredicted" stroke={brandColors.primary} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Predicted" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Reading Duration Trend */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Reading & Audiobook (min)</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartDataWithPrediction}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="readingMinutes" stackId="1" stroke="#3b82f6" fill="#93c5fd" name="Ebook" />
                  <Area type="monotone" dataKey="audiobookMinutes" stackId="1" stroke="#8b5cf6" fill="#c4b5fd" name="Audiobook" />
                  <Line type="monotone" dataKey="readingPredicted" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Predicted" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Business Mix: Ebook vs Audiobook */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Ebook vs Audiobook Users</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ebookActiveUsers" fill="#3b82f6" name="Ebook" />
                  <Bar dataKey="audiobookActiveUsers" fill="#8b5cf6" name="Audiobook" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Business Share Trend */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Business Share Trend (%)</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="ebookShare" stackId="1" stroke="#3b82f6" fill="#93c5fd" name="Ebook %" />
                  <Area type="monotone" dataKey="audiobookShare" stackId="1" stroke="#8b5cf6" fill="#c4b5fd" name="Audiobook %" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Usage & Cost */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>AI Usage & Cost</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="aiInteractions" stroke="#f59e0b" strokeWidth={2} dot={false} name="Interactions" />
                  <Line yAxisId="right" type="monotone" dataKey="aiCostUsd" stroke="#ef4444" strokeWidth={2} dot={false} name="Cost ($)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Monetization */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Monetization</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="paywallViews" stroke="#6366f1" strokeWidth={1} dot={false} name="Paywall Views" />
                  <Line yAxisId="left" type="monotone" dataKey="purchases" stroke="#22c55e" strokeWidth={2} dot={false} name="Purchases" />
                  <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="#f59e0b" strokeWidth={2} dot={false} name="Conv Rate (%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Health */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Health: Errors & Uptime</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[95, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="sentryErrors" stroke="#ef4444" strokeWidth={2} dot={false} name="Errors" />
                  <Line yAxisId="right" type="monotone" dataKey="apiUptime" stroke="#22c55e" strokeWidth={2} dot={false} name="Uptime (%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Cross-validation */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Cross-Validation: PostHog vs Amplitude DAU</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.filter(d => d.ampDau != null)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="dau" stroke={brandColors.primary} strokeWidth={2} dot={false} name="PostHog DAU" />
                  <Line type="monotone" dataKey="ampDau" stroke="#f59e0b" strokeWidth={2} dot={false} name="Amplitude DAU" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
