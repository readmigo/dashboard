import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  LinearProgress,
  Box,
} from '@mui/material';
import { brandColors } from '../../../theme/brandTokens';

interface LocationDistribution {
  location: string;
  userCount: number;
  percentage: number;
  activeUsers: number;
  activityRate: number;
}

interface LocationTableProps {
  data: LocationDistribution[];
}

export const LocationTable = ({ data }: LocationTableProps) => {
  const maxCount = Math.max(...data.map((item) => item.userCount));

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Top Locations (Countries)
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Users</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Distribution</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                Activity Rate
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.location} hover>
                <TableCell>
                  <Typography variant="h6" color="primary">
                    #{index + 1}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight="medium">
                    {item.location}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1">{item.userCount.toLocaleString()}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {item.percentage.toFixed(1)}%
                  </Typography>
                </TableCell>
                <TableCell>
                  <LinearProgress
                    variant="determinate"
                    value={(item.userCount / maxCount) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#E0E0E0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: brandColors.primary,
                      },
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{item.activityRate.toFixed(1)}%</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
