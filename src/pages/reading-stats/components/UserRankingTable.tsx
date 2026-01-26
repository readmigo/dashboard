import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from '@mui/material';

interface UserStats {
  rank: number;
  userId: string;
  displayName: string;
  totalReadingMinutes: number;
  booksReadCount: number;
  totalSessions: number;
  averageSessionDuration: number;
  daysActive: number;
}

interface UserRankingTableProps {
  users: UserStats[];
}

export const UserRankingTable = ({ users }: UserRankingTableProps) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Rank</TableCell>
            <TableCell>User</TableCell>
            <TableCell align="right">Total Minutes</TableCell>
            <TableCell align="right">Books Read</TableCell>
            <TableCell align="right">Sessions</TableCell>
            <TableCell align="right">Avg Session</TableCell>
            <TableCell align="right">Days Active</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.userId} hover>
              <TableCell>
                <Typography variant="h6" color="primary">
                  #{user.rank}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1" fontWeight="medium">
                  {user.displayName}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body1" fontWeight="medium">
                  {user.totalReadingMinutes.toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Chip
                  label={user.booksReadCount}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">{user.totalSessions.toLocaleString()}</TableCell>
              <TableCell align="right">
                {user.averageSessionDuration.toFixed(1)} min
              </TableCell>
              <TableCell align="right">
                <Chip
                  label={user.daysActive}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
