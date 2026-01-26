import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Box,
  Typography,
} from '@mui/material';

interface BookStats {
  rank: number;
  bookId: string;
  title: string;
  author: string;
  coverUrl: string;
  totalReadingMinutes: number;
  uniqueReaders: number;
  totalSessions: number;
  averageMinutesPerReader: number;
}

interface BookRankingTableProps {
  books: BookStats[];
}

export const BookRankingTable = ({ books }: BookRankingTableProps) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Rank</TableCell>
            <TableCell>Book</TableCell>
            <TableCell align="right">Total Minutes</TableCell>
            <TableCell align="right">Unique Readers</TableCell>
            <TableCell align="right">Sessions</TableCell>
            <TableCell align="right">Avg Min/Reader</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.bookId} hover>
              <TableCell>
                <Typography variant="h6" color="primary">
                  #{book.rank}
                </Typography>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={book.coverUrl}
                    alt={book.title}
                    variant="rounded"
                    sx={{ width: 48, height: 64 }}
                  />
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {book.author}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body1" fontWeight="medium">
                  {book.totalReadingMinutes.toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell align="right">{book.uniqueReaders.toLocaleString()}</TableCell>
              <TableCell align="right">{book.totalSessions.toLocaleString()}</TableCell>
              <TableCell align="right">
                {book.averageMinutesPerReader.toFixed(1)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
