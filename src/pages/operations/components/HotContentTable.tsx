import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';

interface HotContentItem {
  rank: number;
  contentId: string;
  title?: string;
  coverUrl?: string;
  author?: string;
  score: number;
  viewCount: number;
  shareCount: number;
  interactionCount: number;
}

interface HotContentTableProps {
  title: string;
  items: HotContentItem[];
  type: 'BOOK' | 'QUOTE' | 'AUTHOR';
}

export const HotContentTable = ({ title, items, type }: HotContentTableProps) => {
  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#9E9E9E';
  };

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent sx={{ p: 0 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={60}>Rank</TableCell>
              <TableCell>{type === 'AUTHOR' ? 'Author' : 'Content'}</TableCell>
              <TableCell align="right">Views</TableCell>
              <TableCell align="right">Shares</TableCell>
              <TableCell align="right">Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.contentId} hover>
                <TableCell>
                  <Chip
                    label={`#${item.rank}`}
                    size="small"
                    sx={{
                      backgroundColor: getRankColor(item.rank),
                      color: item.rank <= 3 ? '#000' : '#fff',
                      fontWeight: 'bold',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {item.coverUrl && (
                      <Avatar
                        src={item.coverUrl}
                        variant={type === 'AUTHOR' ? 'circular' : 'rounded'}
                        sx={{ width: 40, height: 40, mr: 2 }}
                      />
                    )}
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {item.title || 'Unknown'}
                      </Typography>
                      {item.author && (
                        <Typography variant="caption" color="textSecondary">
                          {item.author}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" alignItems="center" justifyContent="flex-end">
                    <VisibilityIcon fontSize="small" sx={{ mr: 0.5, color: '#9E9E9E' }} />
                    {item.viewCount.toLocaleString()}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" alignItems="center" justifyContent="flex-end">
                    <ShareIcon fontSize="small" sx={{ mr: 0.5, color: '#9E9E9E' }} />
                    {item.shareCount.toLocaleString()}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold" color="primary">
                    {Math.round(item.score).toLocaleString()}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
