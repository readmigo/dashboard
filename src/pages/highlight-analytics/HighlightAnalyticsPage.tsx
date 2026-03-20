import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import HighlightIcon from '@mui/icons-material/Highlight';
import PeopleIcon from '@mui/icons-material/People';
import PercentIcon from '@mui/icons-material/Percent';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { StatCard } from '../../components/common/StatCard';
import { POSTHOG_CONFIG, POSTHOG_API } from '../../config/analytics-config';
import {
  highlightPenetrationQuery,
  highlightsPerUserQuery,
  highlightColorQuery,
  highlightStyleQuery,
  highlightTextLengthQuery,
  topHighlightedBooksQuery,
  highlightCreateDeleteQuery,
  highlightPlatformQuery,
  buildHogQLRequest,
} from '../../config/posthog-queries';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { brandColors, semanticColors, chartPalette } from '../../theme/brandTokens';

// Color mapping for highlight colors
const HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: '#FFD36A',
  green: '#6ED6A8',
  blue: '#8BB9FF',
  pink: '#F6B6E8',
  purple: '#B9B3F5',
  orange: '#FFC26A',
};

interface HogQLResult {
  columns: string[];
  results: unknown[][];
}

interface HotParagraph {
  bookId: string;
  bookTitle: string;
  authorName: string;
  coverUrl: string;
  chapterId: string;
  paragraphIndex: number;
  thoughtCount: number;
  selectedText: string;
}

const runHogQL = async (query: string): Promise<HogQLResult> => {
  const apiKey = import.meta.env.VITE_POSTHOG_PERSONAL_API_KEY || POSTHOG_CONFIG.personalApiKey;
  const res = await fetch(POSTHOG_API.query, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildHogQLRequest(query)),
  });
  if (!res.ok) throw new Error(`PostHog query failed: ${res.status}`);
  return res.json();
};

export const HighlightAnalyticsPage = () => {
  const { apiBaseUrl } = useEnvironment();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PostHog data
  const [penetrationData, setPenetrationData] = useState<unknown[]>([]);
  const [perUserData, setPerUserData] = useState<unknown[]>([]);
  const [colorData, setColorData] = useState<unknown[]>([]);
  const [styleData, setStyleData] = useState<unknown[]>([]);
  const [textLengthData, setTextLengthData] = useState<unknown[]>([]);
  const [topBooksData, setTopBooksData] = useState<unknown[]>([]);
  const [createDeleteData, setCreateDeleteData] = useState<unknown[]>([]);
  const [platformData, setPlatformData] = useState<unknown[]>([]);

  // Hot paragraphs from self-built API
  const [hotParagraphs, setHotParagraphs] = useState<HotParagraph[]>([]);

  // Summary stats
  const [totalHighlights, setTotalHighlights] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [avgPenetration, setAvgPenetration] = useState(0);
  const [totalDeleted, setTotalDeleted] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Run all PostHog queries in parallel
      const [
        penetrationRes,
        perUserRes,
        colorRes,
        styleRes,
        textLengthRes,
        topBooksRes,
        createDeleteRes,
        platformRes,
      ] = await Promise.all([
        runHogQL(highlightPenetrationQuery(30)),
        runHogQL(highlightsPerUserQuery(30)),
        runHogQL(highlightColorQuery(30)),
        runHogQL(highlightStyleQuery(30)),
        runHogQL(highlightTextLengthQuery(30)),
        runHogQL(topHighlightedBooksQuery(30, 10)),
        runHogQL(highlightCreateDeleteQuery(30)),
        runHogQL(highlightPlatformQuery(30)),
      ]);

      // Transform results
      const toObjects = (res: HogQLResult) =>
        res.results.map((row) =>
          Object.fromEntries(res.columns.map((col, i) => [col, row[i]]))
        );

      const penetration = toObjects(penetrationRes);
      const perUser = toObjects(perUserRes);
      const colors = toObjects(colorRes);
      const styles = toObjects(styleRes);
      const textLengths = toObjects(textLengthRes);
      const topBooks = toObjects(topBooksRes);
      const createDelete = toObjects(createDeleteRes);
      const platforms = toObjects(platformRes);

      setPenetrationData(penetration);
      setPerUserData(perUser);
      setColorData(colors);
      setStyleData(styles);
      setTextLengthData(textLengths);
      setTopBooksData(topBooks);
      setCreateDeleteData(createDelete);
      setPlatformData(platforms);

      // Calculate summary stats
      const sumHighlights = perUser.reduce((sum: number, d: Record<string, unknown>) => sum + (Number(d.total_highlights) || 0), 0);
      const sumUsers = new Set(perUser.map((d: Record<string, unknown>) => d.users)).size > 0
        ? perUser.reduce((max: number, d: Record<string, unknown>) => Math.max(max, Number(d.users) || 0), 0)
        : 0;
      const avgPen = penetration.length > 0
        ? penetration.reduce((sum: number, d: Record<string, unknown>) => sum + (Number(d.penetration_pct) || 0), 0) / penetration.length
        : 0;
      const sumDeleted = createDelete.reduce((sum: number, d: Record<string, unknown>) => sum + (Number(d.deleted) || 0), 0);

      setTotalHighlights(sumHighlights);
      setTotalUsers(sumUsers);
      setAvgPenetration(Math.round(avgPen * 10) / 10);
      setTotalDeleted(sumDeleted);

      // Fetch hot paragraphs from self-built API
      try {
        const token = sessionStorage.getItem('adminToken');
        const hotRes = await fetch(`${apiBaseUrl}/api/v1/annotations/stats/hot-paragraphs?limit=20`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (hotRes.ok) {
          const hotData = await hotRes.json();
          setHotParagraphs(Array.isArray(hotData) ? hotData : hotData.data || []);
        }
      } catch {
        // Hot paragraphs are optional, don't fail the page
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load highlight analytics');
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" action={<Button onClick={fetchData}>Retry</Button>}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Highlight Analytics</Typography>
        <Button startIcon={<RefreshIcon />} onClick={fetchData} variant="outlined" size="small">
          Refresh
        </Button>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Highlights (30d)"
            value={totalHighlights}
            icon={<HighlightIcon fontSize="large" />}
            color={brandColors.primary}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Peak Daily Users"
            value={totalUsers}
            icon={<PeopleIcon fontSize="large" />}
            color={semanticColors.success}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Penetration"
            value={`${avgPenetration}%`}
            icon={<PercentIcon fontSize="large" />}
            color={brandColors.purple}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Deleted (30d)"
            value={totalDeleted}
            icon={<DeleteIcon fontSize="large" />}
            color={semanticColors.warning}
          />
        </Grid>
      </Grid>

      {/* Penetration Trend */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="User Penetration Trend" subheader="Highlight users as % of DAU" />
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={penetrationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tickFormatter={(v) => String(v).slice(5)} />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="penetration_pct" name="Penetration %" stroke={brandColors.primary} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Create vs Delete Trend" />
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={createDeleteData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tickFormatter={(v) => String(v).slice(5)} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="created" name="Created" stroke={semanticColors.success} dot={false} />
                  <Line type="monotone" dataKey="deleted" name="Deleted" stroke={semanticColors.error} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Per User Trend */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Highlights Per User (Daily)" subheader="Average highlights created per active highlight user" />
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={perUserData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tickFormatter={(v) => String(v).slice(5)} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="per_user" name="Per User" stroke={brandColors.blue} dot={false} />
                  <Line type="monotone" dataKey="total_highlights" name="Total" stroke={chartPalette[3]} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Color & Style Distribution */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Color Distribution" />
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={colorData}
                    dataKey="cnt"
                    nameKey="color"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ color, pct }: { color: string; pct: number }) => `${color} ${pct}%`}
                  >
                    {(colorData as Record<string, unknown>[]).map((entry, idx) => (
                      <Cell key={idx} fill={HIGHLIGHT_COLORS[String(entry.color)] || chartPalette[idx % chartPalette.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Style Distribution" />
            <CardContent>
              {styleData.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={250}>
                  <Typography color="textSecondary">No style data yet (iOS/Android only)</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={styleData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="style" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="cnt" name="Count" fill={brandColors.purple} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Text Length Distribution" />
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={textLengthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="length_bucket" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cnt" name="Count" fill={brandColors.blue} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Books & Platform */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Top 10 Most Highlighted Books" />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Book</TableCell>
                      <TableCell align="right">Highlights</TableCell>
                      <TableCell align="right">Users</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(topBooksData as Record<string, unknown>[]).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{String(row.book)}</TableCell>
                        <TableCell align="right">{Number(row.highlights).toLocaleString()}</TableCell>
                        <TableCell align="right">{Number(row.users)}</TableCell>
                      </TableRow>
                    ))}
                    {topBooksData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">No data</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Platform Distribution" />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Platform</TableCell>
                      <TableCell align="right">Highlights</TableCell>
                      <TableCell align="right">Users</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(platformData as Record<string, unknown>[]).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{String(row.platform) || 'Unknown'}</TableCell>
                        <TableCell align="right">{Number(row.cnt).toLocaleString()}</TableCell>
                        <TableCell align="right">{Number(row.users)}</TableCell>
                      </TableRow>
                    ))}
                    {platformData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">No data</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Hot Paragraphs */}
      {hotParagraphs.length > 0 && (
        <Card>
          <CardHeader
            title="Hot Paragraphs"
            subheader="Most annotated paragraphs by public thoughts"
            avatar={<WhatshotIcon sx={{ color: semanticColors.error }} />}
          />
          <CardContent>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Book</TableCell>
                    <TableCell>Excerpt</TableCell>
                    <TableCell align="right">Thoughts</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hotParagraphs.map((p, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>{p.bookTitle}</Typography>
                          <Typography variant="caption" color="textSecondary">{p.authorName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.selectedText}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={p.thoughtCount} size="small" color="error" variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
