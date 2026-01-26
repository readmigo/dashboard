import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Tooltip,
} from '@mui/material';

interface CohortData {
  cohortDate: string;
  cohortSize: number;
  d1Rate: number | null;
  d7Rate: number | null;
  d30Rate: number | null;
  d1Retained: number | null;
  d7Retained: number | null;
  d30Retained: number | null;
}

interface CohortHeatmapProps {
  data: CohortData[];
}

export const CohortHeatmap = ({ data }: CohortHeatmapProps) => {
  const getColor = (rate: number | null) => {
    if (rate === null) return '#F5F5F5';
    if (rate >= 80) return '#4CAF50';
    if (rate >= 60) return '#8BC34A';
    if (rate >= 40) return '#FFC107';
    if (rate >= 20) return '#FF9800';
    return '#FF5722';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Cohort Retention Matrix
      </Typography>
      <Typography variant="body2" color="textSecondary" mb={2}>
        Shows retention rates for users registered on each date. Colors indicate retention health: Green (80%+), Yellow-Green (60-80%), Yellow (40-60%), Orange (20-40%), Red (0-20%)
      </Typography>
      <TableContainer sx={{ maxHeight: 600, overflowY: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Cohort Date</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                Users
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 120 }}>
                D1 Retention
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 120 }}>
                D7 Retention
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 120 }}>
                D30 Retention
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((cohort) => (
              <TableRow key={cohort.cohortDate} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {formatDate(cohort.cohortDate)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{cohort.cohortSize.toLocaleString()}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip
                    title={
                      cohort.d1Rate !== null
                        ? `${cohort.d1Retained} / ${cohort.cohortSize} users active on D1`
                        : 'Data not yet available'
                    }
                    arrow
                  >
                    <Box
                      sx={{
                        backgroundColor: getColor(cohort.d1Rate),
                        borderRadius: 1,
                        p: 1,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {cohort.d1Rate !== null ? `${cohort.d1Rate.toFixed(1)}%` : '--'}
                      </Typography>
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip
                    title={
                      cohort.d7Rate !== null
                        ? `${cohort.d7Retained} / ${cohort.cohortSize} users active on D7`
                        : 'Data not yet available'
                    }
                    arrow
                  >
                    <Box
                      sx={{
                        backgroundColor: getColor(cohort.d7Rate),
                        borderRadius: 1,
                        p: 1,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {cohort.d7Rate !== null ? `${cohort.d7Rate.toFixed(1)}%` : '--'}
                      </Typography>
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip
                    title={
                      cohort.d30Rate !== null
                        ? `${cohort.d30Retained} / ${cohort.cohortSize} users active on D30`
                        : 'Data not yet available'
                    }
                    arrow
                  >
                    <Box
                      sx={{
                        backgroundColor: getColor(cohort.d30Rate),
                        borderRadius: 1,
                        p: 1,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {cohort.d30Rate !== null ? `${cohort.d30Rate.toFixed(1)}%` : '--'}
                      </Typography>
                    </Box>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
