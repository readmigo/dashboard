import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslate } from 'react-admin';
import {
  Box, Card, CardContent, Typography, Grid, CircularProgress, Alert,
  TextField, Button, ButtonGroup, Stack, Chip, useMediaQuery, useTheme,
  Table, TableBody, TableRow, TableCell, Divider,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import { adminFetch } from '../../utils/api-client';
import { brandColors, semanticColors, textColors, bgColors } from '../../theme/brandTokens';

// ---------------- Types matching api response ----------------
interface TopItem { title: string; sessions?: number; plays?: number; readers?: number; listeners?: number; }
interface PushMessage { title: string; body: string; type: string; }
interface ContentGapItem { audiobookId?: string; title?: string; voiceId?: string; errorType: string; count: number; users: number; }
interface LocaleGapItem { locale: string; users: number; reads: number; abPlays: number; tts: number; }
interface EngagementCategory { actions: number; users: number; avgPerUser: number; avgMinPerUser?: number; }

interface DailyReportData {
  date: string;
  dau: number; dauIos: number; dauAndroid: number; dauWeb: number;
  newSignups: number;
  readingMinutes: number; readingSessions: number; avgMinutesPerUser: number;
  booksFinished: number; pagesRead: number;
  audiobookPlays: number; audiobookListeners: number; audiobookMinutes: number;
  ebookActiveUsers: number; audiobookActiveUsers: number; bothActiveUsers: number;
  ebookShare: number; audiobookShare: number;
  shares: number; postcards: number; highlights: number; wordsLearned: number;
  pushSent: number; pushFailed: number; pushOpened: number; pushOpenRate: number;
  pushTokensIos: number; pushTokensAndroid: number;
  paywallViews: number; purchases: number; conversionRate: number;
  sentryErrors: number; apiUptime: number; avgResponseMs: number;
  websitePageviews: number; websiteVisits: number;
  ampDau: number | null; dauDeviation: number | null;
  topBooks: TopItem[];
  topAudiobooks: TopItem[];
  pushMessages: PushMessage[];
  websiteTopPages: { path: string; pageviews: number; visits: number }[];
  websiteTopCountries: { country: string; pageviews: number; visits: number }[];
  contentGaps: {
    audiobookFailures: ContentGapItem[];
    ttsErrors: ContentGapItem[];
    localeGaps: LocaleGapItem[];
  } | null;
  engagement: {
    reading: EngagementCategory;
    audiobook: EngagementCategory;
    content: EngagementCategory;
    browsing: EngagementCategory;
  } | null;
  hasEnriched: boolean;
}

interface ApiResponse {
  report: DailyReportData;
  previous: DailyReportData | null;
}

// ---------------- Helpers ----------------
function yyyymmdd(d: Date): string {
  return d.toISOString().split('T')[0];
}

function delta(current: number, previous: number | null | undefined): { text: string; tone: 'up' | 'down' | 'flat' } {
  if (previous == null || previous === 0) return { text: '—', tone: 'flat' };
  const diff = current - previous;
  const pct = (diff / previous) * 100;
  if (Math.abs(pct) < 0.1) return { text: '0%', tone: 'flat' };
  const sign = pct > 0 ? '+' : '';
  return {
    text: `${sign}${pct.toFixed(1)}%`,
    tone: pct > 0 ? 'up' : 'down',
  };
}

function deltaColor(tone: 'up' | 'down' | 'flat', invert = false): string {
  if (tone === 'flat') return textColors.hint;
  const isGood = invert ? tone === 'down' : tone === 'up';
  return isGood ? semanticColors.success : semanticColors.error;
}

// ---------------- Sub-components ----------------
function KpiCard({
  label, value, deltaText, deltaTone, invertDelta = false,
}: {
  label: string; value: string | number;
  deltaText?: string; deltaTone?: 'up' | 'down' | 'flat'; invertDelta?: boolean;
}) {
  return (
    <Card sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Typography variant="caption" sx={{ color: textColors.secondary, fontSize: { xs: 11, sm: 12 } }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: { xs: 18, sm: 22 }, fontWeight: 700, mt: 0.5, color: textColors.primary }}>
          {value}
        </Typography>
        {deltaText && deltaTone && (
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: deltaColor(deltaTone, invertDelta), mt: 0.5 }}>
            {deltaTone === 'up' ? '↑' : deltaTone === 'down' ? '↓' : '—'} {deltaText}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function SectionCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <Card sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{
        bgcolor: bgColors.subtle,
        px: { xs: 2, sm: 2.5 },
        py: 1.25,
        borderBottom: `1px solid ${bgColors.subtle}`,
        display: 'flex', alignItems: 'center', gap: 1,
      }}>
        <Box component="span" sx={{ fontSize: 16 }}>{icon}</Box>
        <Typography sx={{ fontWeight: 600, fontSize: { xs: 13, sm: 14 } }}>{title}</Typography>
      </Box>
      {children}
    </Card>
  );
}

interface MetricRowProps {
  name: string;
  value: React.ReactNode;
  extra?: React.ReactNode;
  isMobile: boolean;
}
function MetricRow({ name, value, extra, isMobile }: MetricRowProps) {
  if (isMobile) {
    return (
      <TableRow>
        <TableCell sx={{ py: 1.25, px: 2, borderBottom: `1px solid ${bgColors.subtle}` }}>
          <Typography sx={{ fontSize: 12, color: textColors.secondary }}>{name}</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: textColors.primary, mt: 0.25 }}>{value}</Typography>
          {extra && (
            <Typography component="div" sx={{ fontSize: 12, color: textColors.hint, mt: 0.25 }}>{extra}</Typography>
          )}
        </TableCell>
      </TableRow>
    );
  }
  return (
    <TableRow>
      <TableCell sx={{ py: 1.25, px: 2.5, color: textColors.secondary, width: '30%', borderBottom: `1px solid ${bgColors.subtle}` }}>{name}</TableCell>
      <TableCell sx={{ py: 1.25, px: 2.5, fontWeight: 600, color: textColors.primary, width: '25%', borderBottom: `1px solid ${bgColors.subtle}` }}>{value}</TableCell>
      <TableCell sx={{ py: 1.25, px: 2.5, color: textColors.hint, fontSize: 13, borderBottom: `1px solid ${bgColors.subtle}` }}>{extra}</TableCell>
    </TableRow>
  );
}

function DeltaSpan({ d, invert = false }: { d: ReturnType<typeof delta>; invert?: boolean }) {
  return <Box component="span" sx={{ color: deltaColor(d.tone, invert), fontWeight: 500 }}>{d.text}</Box>;
}

// ---------------- Main component ----------------
export function DailyReportView() {
  const translate = useTranslate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const yesterday = useMemo(() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    return yyyymmdd(d);
  }, []);

  const [date, setDate] = useState(yesterday);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (targetDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminFetch<ApiResponse>(`/api/v1/admin/operations/daily-reports/${targetDate}`);
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('HTTP 404') || message.includes('404')) {
        setData(null);
        setError(translate('dailyReportView.notFound', { _: 'No report found for this date' }));
        return;
      }
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [translate]);

  useEffect(() => { fetchData(date); }, [date, fetchData]);

  const setRelativeDate = (daysAgo: number) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - daysAgo);
    setDate(yyyymmdd(d));
  };

  const report = data?.report;
  const prev = data?.previous;

  // ---------------- Render ----------------
  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: { xs: 20, sm: 24 }, fontWeight: 700 }}>
          {translate('dailyReportView.title', { _: '每日运营日报' })}
        </Typography>
        <Typography sx={{ fontSize: 13, color: textColors.secondary, mt: 0.5 }}>
          {translate('dailyReportView.subtitle', { _: '来自 pipeline daily_reports 表，排除内部测试用户 · 时区 UTC' })}
        </Typography>
      </Box>

      {/* Date bar */}
      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <TextField
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              size="small"
              inputProps={{ max: yesterday }}
              sx={{ maxWidth: 170 }}
            />
            <ButtonGroup size="small" variant="outlined">
              <Button onClick={() => setRelativeDate(1)} variant={date === yesterday ? 'contained' : 'outlined'}>
                {translate('dailyReportView.quick.yesterday', { _: '昨日' })}
              </Button>
              <Button onClick={() => setRelativeDate(2)}>
                {translate('dailyReportView.quick.dayBefore', { _: '前日' })}
              </Button>
              <Button onClick={() => setRelativeDate(7)}>
                {translate('dailyReportView.quick.weekAgo', { _: '7日前' })}
              </Button>
            </ButtonGroup>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              size="small"
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => fetchData(date)}
              disabled={loading}
            >
              {translate('dailyReportView.refresh', { _: '刷新' })}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && report && (
        <>
          {!report.hasEnriched && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {translate('dailyReportView.legacyNotice', {
                _: '此日期为旧版日报，仅显示核心指标。Top 内容、参与度、推送明细等需在 storage.ts 升级后产出的日报中查看。',
              })}
            </Alert>
          )}

          {/* Alerts */}
          <AlertSection report={report} prev={prev} translate={translate} />

          {/* Content gaps */}
          {report.contentGaps && <ContentGapsSection gaps={report.contentGaps} translate={translate} />}

          {/* KPI cards */}
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={4} md={2}>
              <KpiCard label="DAU" value={report.dau}
                deltaText={delta(report.dau, prev?.dau).text}
                deltaTone={delta(report.dau, prev?.dau).tone} />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <KpiCard label={translate('dailyReportView.kpi.signups', { _: '新注册' })} value={report.newSignups}
                deltaText={delta(report.newSignups, prev?.newSignups).text}
                deltaTone={delta(report.newSignups, prev?.newSignups).tone} />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <KpiCard label={translate('dailyReportView.kpi.readingMin', { _: '阅读时长 (min)' })}
                value={report.readingMinutes.toLocaleString()}
                deltaText={delta(report.readingMinutes, prev?.readingMinutes).text}
                deltaTone={delta(report.readingMinutes, prev?.readingMinutes).tone} />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <KpiCard label={translate('dailyReportView.kpi.conversion', { _: '付费转化' })}
                value={`${report.conversionRate.toFixed(1)}%`}
                deltaText={delta(report.conversionRate, prev?.conversionRate).text}
                deltaTone={delta(report.conversionRate, prev?.conversionRate).tone} />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <KpiCard label={translate('dailyReportView.kpi.errors', { _: 'Sentry 错误' })} value={report.sentryErrors}
                deltaText={delta(report.sentryErrors, prev?.sentryErrors).text}
                deltaTone={delta(report.sentryErrors, prev?.sentryErrors).tone} invertDelta />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <KpiCard label={translate('dailyReportView.kpi.uptime', { _: 'API 可用率' })}
                value={`${report.apiUptime.toFixed(2)}%`}
                deltaText={delta(report.apiUptime, prev?.apiUptime).text}
                deltaTone={delta(report.apiUptime, prev?.apiUptime).tone} />
            </Grid>
          </Grid>

          {/* User */}
          <SectionCard icon="👤" title={translate('dailyReportView.section.user', { _: '用户' })}>
            <Table size="small">
              <TableBody>
                <MetricRow isMobile={isMobile}
                  name={translate('dailyReportView.user.dau', { _: '日活 (DAU)' })}
                  value={report.dau.toLocaleString()}
                  extra={<><DeltaSpan d={delta(report.dau, prev?.dau)} /> · iOS {report.dauIos} / Android {report.dauAndroid} / Web {report.dauWeb}</>} />
                <MetricRow isMobile={isMobile}
                  name={translate('dailyReportView.user.signups', { _: '新注册' })}
                  value={report.newSignups}
                  extra={<DeltaSpan d={delta(report.newSignups, prev?.newSignups)} />} />
              </TableBody>
            </Table>
          </SectionCard>

          {/* Ebook reading */}
          <SectionCard icon="📖" title={translate('dailyReportView.section.ebook', { _: '电子书阅读' })}>
            <Table size="small">
              <TableBody>
                <MetricRow isMobile={isMobile}
                  name={translate('dailyReportView.ebook.minutes', { _: '总阅读时长' })}
                  value={`${report.readingMinutes.toLocaleString()} ${translate('dailyReportView.unit.min', { _: '分钟' })}`}
                  extra={<DeltaSpan d={delta(report.readingMinutes, prev?.readingMinutes)} />} />
                <MetricRow isMobile={isMobile}
                  name={translate('dailyReportView.ebook.sessions', { _: '阅读场次 / 人均时长' })}
                  value={`${report.readingSessions.toLocaleString()} 次`}
                  extra={`${report.avgMinutesPerUser.toFixed(1)} 分钟/人`} />
                <MetricRow isMobile={isMobile}
                  name={translate('dailyReportView.ebook.pages', { _: '翻页数' })}
                  value={`${report.pagesRead.toLocaleString()} 页`}
                  extra={<DeltaSpan d={delta(report.pagesRead, prev?.pagesRead)} />} />
              </TableBody>
            </Table>
          </SectionCard>

          {/* Audiobook */}
          <SectionCard icon="🎧" title={translate('dailyReportView.section.audiobook', { _: '有声书' })}>
            <Table size="small">
              <TableBody>
                <MetricRow isMobile={isMobile}
                  name={translate('dailyReportView.audiobook.plays', { _: '播放次数 / 听众数' })}
                  value={`${report.audiobookPlays.toLocaleString()} / ${report.audiobookListeners.toLocaleString()}`}
                  extra={<DeltaSpan d={delta(report.audiobookPlays, prev?.audiobookPlays)} />} />
                <MetricRow isMobile={isMobile}
                  name={translate('dailyReportView.audiobook.minutes', { _: '收听时长' })}
                  value={`${report.audiobookMinutes.toLocaleString()} 分钟`}
                  extra={<DeltaSpan d={delta(report.audiobookMinutes, prev?.audiobookMinutes)} />} />
              </TableBody>
            </Table>
          </SectionCard>

          {/* Business mix */}
          <SectionCard icon="⚖" title={translate('dailyReportView.section.businessMix', { _: '业务比重' })}>
            <Table size="small">
              <TableBody>
                <MetricRow isMobile={isMobile}
                  name={translate('dailyReportView.mix.ebookUsers', { _: '电子书用户' })}
                  value={`${report.ebookActiveUsers} 人 (${report.ebookShare.toFixed(0)}%)`}
                  extra={<MixBar value={report.ebookShare} color={brandColors.blue} />} />
                <MetricRow isMobile={isMobile}
                  name={translate('dailyReportView.mix.audiobookUsers', { _: '有声书用户' })}
                  value={`${report.audiobookActiveUsers} 人 (${report.audiobookShare.toFixed(0)}%)`}
                  extra={<MixBar value={report.audiobookShare} color={brandColors.purple} />} />
                <MetricRow isMobile={isMobile}
                  name={translate('dailyReportView.mix.both', { _: '两者兼用' })}
                  value={`${report.bothActiveUsers} 人`}
                  extra={(() => {
                    const total = report.ebookActiveUsers + report.audiobookActiveUsers - report.bothActiveUsers;
                    return total > 0 ? `${((report.bothActiveUsers / total) * 100).toFixed(0)}% 重叠` : '-';
                  })()} />
              </TableBody>
            </Table>
          </SectionCard>

          {/* Engagement */}
          {report.engagement && (
            <SectionCard icon="📊" title={translate('dailyReportView.section.engagement', { _: '用户参与度对比' })}>
              <Table size="small">
                <TableBody>
                  <MetricRow isMobile={isMobile}
                    name={translate('dailyReportView.engagement.reading', { _: '电子书阅读' })}
                    value={`${report.engagement.reading.avgPerUser} 次/人`}
                    extra={`人均 ${report.engagement.reading.avgMinPerUser ?? 0} 分钟 · ${report.engagement.reading.users} 人参与`} />
                  <MetricRow isMobile={isMobile}
                    name={translate('dailyReportView.engagement.audiobook', { _: '有声书收听' })}
                    value={`${report.engagement.audiobook.avgPerUser} 次/人`}
                    extra={`${report.engagement.audiobook.users} 人参与`} />
                  <MetricRow isMobile={isMobile}
                    name={translate('dailyReportView.engagement.content', { _: '内容创作' })}
                    value={`${report.engagement.content.avgPerUser} 次/人`}
                    extra={`${report.engagement.content.users} 人参与 (划线/分享/学词等)`} />
                  <MetricRow isMobile={isMobile}
                    name={translate('dailyReportView.engagement.browsing', { _: '页面浏览' })}
                    value={`${report.engagement.browsing.avgPerUser} 页/人`}
                    extra={`${report.engagement.browsing.users} 人浏览`} />
                </TableBody>
              </Table>
            </SectionCard>
          )}

          {/* Monetization */}
          <SectionCard icon="💰" title={translate('dailyReportView.section.monetization', { _: '变现' })}>
            <Table size="small">
              <TableBody>
                <MetricRow isMobile={isMobile}
                  name={translate('dailyReportView.money.funnel', { _: '付费墙浏览 → 购买' })}
                  value={`${report.paywallViews} → ${report.purchases}`}
                  extra={<>转化率 {report.conversionRate.toFixed(1)}% · <DeltaSpan d={delta(report.conversionRate, prev?.conversionRate)} /></>} />
              </TableBody>
            </Table>
          </SectionCard>

          {/* Top books / audiobooks */}
          {(report.topBooks?.length > 0 || report.topAudiobooks?.length > 0) && (
            <Grid container spacing={2} sx={{ mb: 0 }}>
              {report.topBooks?.length > 0 && (
                <Grid item xs={12} md={6}>
                  <TopList icon="📚" title={translate('dailyReportView.top.books', { _: '热门电子书 Top 10' })}
                    items={report.topBooks} statKey="reading" />
                </Grid>
              )}
              {report.topAudiobooks?.length > 0 && (
                <Grid item xs={12} md={6}>
                  <TopList icon="🎧" title={translate('dailyReportView.top.audiobooks', { _: '热门有声书 Top 10' })}
                    items={report.topAudiobooks} statKey="audio" />
                </Grid>
              )}
            </Grid>
          )}

          {/* Push */}
          <SectionCard icon="🔔" title={translate('dailyReportView.section.push', { _: 'Push 通知' })}>
            <Table size="small">
              <TableBody>
                <MetricRow isMobile={isMobile}
                  name={translate('dailyReportView.push.tokens', { _: 'Token 覆盖' })}
                  value={`${(report.pushTokensIos + report.pushTokensAndroid).toLocaleString()} 台设备`}
                  extra={`iOS ${report.pushTokensIos} / Android ${report.pushTokensAndroid}`} />
                <MetricRow isMobile={isMobile}
                  name={translate('dailyReportView.push.sent', { _: '发送 / 成功 / 失败' })}
                  value={`${(report.pushSent + report.pushFailed).toLocaleString()} / ${report.pushSent} / ${report.pushFailed}`}
                  extra={(report.pushSent + report.pushFailed) > 0 ? `失败率 ${((report.pushFailed / (report.pushSent + report.pushFailed)) * 100).toFixed(0)}%` : '-'} />
                <MetricRow isMobile={isMobile}
                  name={translate('dailyReportView.push.opened', { _: '打开数 / 打开率' })}
                  value={report.pushOpened}
                  extra={<>{report.pushOpenRate.toFixed(1)}% · <DeltaSpan d={delta(report.pushOpenRate, prev?.pushOpenRate)} /></>} />
              </TableBody>
            </Table>
            {report.pushMessages?.length > 0 && (
              <>
                <Divider />
                <PushMessageList messages={report.pushMessages} isMobile={isMobile} />
              </>
            )}
          </SectionCard>

          {/* Website */}
          {(report.websitePageviews > 0 || report.websiteVisits > 0) && (
            <SectionCard icon="🌐" title={translate('dailyReportView.section.website', { _: '官网流量 (readmigo.app)' })}>
              <Table size="small">
                <TableBody>
                  <MetricRow isMobile={isMobile}
                    name={translate('dailyReportView.website.pv', { _: '页面浏览 (PV)' })}
                    value={report.websitePageviews.toLocaleString()}
                    extra={<DeltaSpan d={delta(report.websitePageviews, prev?.websitePageviews)} />} />
                  <MetricRow isMobile={isMobile}
                    name={translate('dailyReportView.website.visits', { _: '独立访问' })}
                    value={report.websiteVisits.toLocaleString()}
                    extra={<DeltaSpan d={delta(report.websiteVisits, prev?.websiteVisits)} />} />
                  {report.websiteTopCountries?.length > 0 && (
                    <MetricRow isMobile={isMobile}
                      name={translate('dailyReportView.website.topCountries', { _: 'Top 国家' })}
                      value={report.websiteTopCountries.slice(0, 5).map(c => `${c.country} (${c.pageviews})`).join(', ')} />
                  )}
                </TableBody>
              </Table>
              {report.websiteTopPages?.length > 0 && (
                <>
                  <Divider />
                  <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 1.5 }}>
                    <Typography sx={{ fontSize: 12, color: textColors.secondary, fontWeight: 500, mb: 1 }}>
                      {translate('dailyReportView.website.topPages', { _: 'Top 页面' })}
                    </Typography>
                    {report.websiteTopPages.slice(0, 5).map((p, i) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, fontSize: 13 }}>
                        <Box component="span" sx={{ color: textColors.hint, mr: 1 }}>{i + 1}.</Box>
                        <Box component="span" sx={{ flexGrow: 1, color: textColors.primary, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.path}</Box>
                        <Box component="span" sx={{ color: textColors.secondary, whiteSpace: 'nowrap' }}>{p.pageviews} PV / {p.visits} visits</Box>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </SectionCard>
          )}

          {/* Health */}
          <SectionCard icon="🟢" title={translate('dailyReportView.section.health', { _: '系统健康' })}>
            <Table size="small">
              <TableBody>
                <MetricRow isMobile={isMobile}
                  name={translate('dailyReportView.health.errors', { _: 'Sentry 错误数' })}
                  value={report.sentryErrors}
                  extra={<DeltaSpan d={delta(report.sentryErrors, prev?.sentryErrors)} invert />} />
                <MetricRow isMobile={isMobile}
                  name={translate('dailyReportView.health.uptime', { _: 'API 可用性 / 延迟' })}
                  value={`${report.apiUptime.toFixed(2)}%`}
                  extra={`平均 ${report.avgResponseMs}ms`} />
              </TableBody>
            </Table>
          </SectionCard>

          {/* Cross-validation */}
          {report.ampDau != null && (
            <SectionCard icon="🔍" title={translate('dailyReportView.section.crossCheck', { _: '交叉验证' })}>
              <Table size="small">
                <TableBody>
                  <MetricRow isMobile={isMobile}
                    name={translate('dailyReportView.crossCheck.label', { _: 'PostHog vs Amplitude DAU' })}
                    value={`${report.dau} vs ${report.ampDau}`}
                    extra={report.dauDeviation != null ? (
                      <>偏差 {report.dauDeviation.toFixed(1)}%
                        <Chip size="small" sx={{ ml: 1, height: 18, fontSize: 11 }}
                          label={report.dauDeviation < 15 ? '正常' : '偏高'}
                          color={report.dauDeviation < 15 ? 'success' : 'error'} />
                      </>
                    ) : null} />
                </TableBody>
              </Table>
            </SectionCard>
          )}

          {/* Content interaction */}
          <SectionCard icon="📝" title={translate('dailyReportView.section.contentInteract', { _: '内容互动' })}>
            <Table size="small">
              <TableBody>
                <MetricRow isMobile={isMobile}
                  name={translate('dailyReportView.interact.label', { _: '分享 / 明信片 / 划线' })}
                  value={`${report.shares} / ${report.postcards} / ${report.highlights}`}
                  extra={`学词: ${report.wordsLearned} 个`} />
              </TableBody>
            </Table>
          </SectionCard>

          <Box sx={{ textAlign: 'center', pt: 2, color: textColors.hint, fontSize: 12 }}>
            {translate('dailyReportView.footer', {
              _: '数据来源：pipeline daily_reports 表 · 由 GitHub Actions 每日 00:10 UTC 生成',
            })}
          </Box>
        </>
      )}
    </Box>
  );
}

// ---------------- Smaller pieces ----------------
function MixBar({ value, color }: { value: number; color: string }) {
  return (
    <Box sx={{ display: 'inline-block', verticalAlign: 'middle', width: { xs: 100, sm: 180 }, height: 10, bgcolor: bgColors.subtle, borderRadius: '5px', overflow: 'hidden' }}>
      <Box sx={{ width: `${Math.min(Math.max(value, 0), 100)}%`, height: '100%', bgcolor: color, borderRadius: '5px' }} />
    </Box>
  );
}

function AlertSection({ report, prev, translate }: { report: DailyReportData; prev: DailyReportData | null | undefined; translate: (k: string, o?: any) => string }) {
  const alerts: string[] = [];
  if (prev) {
    if (prev.dau > 0 && (report.dau - prev.dau) / prev.dau > 0.3) alerts.push(translate('dailyReportView.alert.dauUp', { _: 'DAU 环比增长 > 30%' }));
    if (prev.dau > 0 && (prev.dau - report.dau) / prev.dau > 0.3) alerts.push(translate('dailyReportView.alert.dauDown', { _: 'DAU 环比下降 > 30%' }));
    if (report.sentryErrors > prev.sentryErrors * 2 && report.sentryErrors > 5) {
      alerts.push(translate('dailyReportView.alert.sentry', { _: `Sentry 错误翻倍：${prev.sentryErrors} → ${report.sentryErrors}`, prev: prev.sentryErrors, curr: report.sentryErrors }));
    }
  }
  if (report.apiUptime > 0 && report.apiUptime < 99) {
    alerts.push(`API 可用性低于 99%: ${report.apiUptime.toFixed(2)}%`);
  }
  if (report.dauDeviation != null && report.dauDeviation > 20) {
    alerts.push(`PostHog vs Amplitude DAU 偏差 ${report.dauDeviation.toFixed(1)}% (>20%)`);
  }
  if (alerts.length === 0) return null;
  return (
    <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
      <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
        {translate('dailyReportView.alert.title', { _: '异常告警' })}
      </Typography>
      {alerts.map((a, i) => <Box key={i} sx={{ fontSize: 13, lineHeight: 1.7 }}>• {a}</Box>)}
    </Alert>
  );
}

function ContentGapsSection({ gaps, translate }: { gaps: NonNullable<DailyReportData['contentGaps']>; translate: (k: string, o?: any) => string }) {
  const items: React.ReactNode[] = [];
  const totalTtsErrors = (gaps.ttsErrors ?? []).reduce((s, e) => s + e.count, 0);
  if (totalTtsErrors > 0) {
    const details = gaps.ttsErrors.slice(0, 3).map(e => `${e.voiceId || 'unknown'}: ${e.errorType} (${e.count}次/${e.users}人)`).join(', ');
    items.push(<><b>TTS 错误 {totalTtsErrors} 次</b> — {details}</>);
  }
  if (gaps.audiobookFailures?.length > 0) {
    const details = gaps.audiobookFailures.slice(0, 5).map(f => `${(f.title || f.audiobookId || '?').slice(0, 20)} (${f.count}次/${f.users}人, ${f.errorType})`).join('; ');
    items.push(<><b>有声书加载失败</b> — {details}</>);
  }
  const noTts = (gaps.localeGaps ?? []).filter(l => l.users >= 3 && l.reads > 0 && l.tts === 0);
  if (noTts.length > 0) {
    items.push(<><b>TTS 缺失语言</b> — {noTts.map(l => `${l.locale} (${l.users}人, ${l.reads}次阅读)`).join(', ')}</>);
  }
  const noAb = (gaps.localeGaps ?? []).filter(l => l.users >= 3 && l.reads >= 10 && l.abPlays === 0);
  if (noAb.length > 0) {
    items.push(<><b>有声书缺失语言</b> — {noAb.map(l => `${l.locale} (${l.users}人, ${l.reads}次阅读)`).join(', ')}</>);
  }
  if (items.length === 0) return null;
  return (
    <Alert severity="warning" icon={<AssignmentLateIcon />} sx={{ mb: 2, '& .MuiAlert-message': { width: '100%' } }}>
      <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
        {translate('dailyReportView.gaps.title', { _: `运营待办 (${items.length} 项)`, count: items.length })}
      </Typography>
      {items.map((item, i) => <Box key={i} sx={{ fontSize: 13, lineHeight: 1.8 }}>☐ {item}</Box>)}
    </Alert>
  );
}

function TopList({ icon, title, items, statKey }: {
  icon: string; title: string; items: TopItem[]; statKey: 'reading' | 'audio';
}) {
  return (
    <SectionCard icon={icon} title={title}>
      <Box sx={{ p: 0 }}>
        {items.slice(0, 10).map((it, i) => (
          <Box key={i} sx={{
            display: 'flex', alignItems: 'center',
            px: { xs: 2, sm: 2.5 }, py: 0.85,
            borderBottom: i === Math.min(9, items.length - 1) ? 'none' : `1px solid ${bgColors.subtle}`,
            fontSize: 13,
          }}>
            <Box component="span" sx={{ width: 24, color: textColors.hint }}>{i + 1}</Box>
            <Box component="span" sx={{ flexGrow: 1, color: textColors.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mr: 1 }}>
              {it.title}
            </Box>
            <Box component="span" sx={{ color: textColors.secondary, whiteSpace: 'nowrap' }}>
              {statKey === 'reading'
                ? `${it.sessions ?? 0} 次 / ${it.readers ?? 0} 人`
                : `${it.plays ?? 0} 次 / ${it.listeners ?? 0} 人`}
            </Box>
          </Box>
        ))}
      </Box>
    </SectionCard>
  );
}

function PushMessageList({ messages, isMobile }: { messages: PushMessage[]; isMobile: boolean }) {
  // Dedupe by title
  const seen = new Set<string>();
  const unique: PushMessage[] = [];
  for (const m of messages) {
    if (!seen.has(m.title)) { seen.add(m.title); unique.push(m); }
  }
  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
      {unique.map((m, i) => (
        <Box key={i} sx={{
          py: 0.85,
          borderBottom: i === unique.length - 1 ? 'none' : `1px solid ${bgColors.subtle}`,
          display: isMobile ? 'block' : 'flex', gap: 1, alignItems: 'center',
        }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: textColors.primary, flexBasis: isMobile ? 'auto' : '30%' }}>{m.title}</Typography>
          <Typography sx={{ fontSize: 12, color: textColors.secondary, flexGrow: 1, mt: isMobile ? 0.25 : 0 }}>
            {m.body.length > 60 ? m.body.slice(0, 60) + '...' : m.body}
          </Typography>
          <Chip label={m.type} size="small" sx={{ height: 18, fontSize: 11, mt: isMobile ? 0.5 : 0 }} />
        </Box>
      ))}
    </Box>
  );
}
