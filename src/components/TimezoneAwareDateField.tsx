import { useRecordContext } from 'react-admin';
import { Typography } from '@mui/material';
import { useTimezone } from '../contexts/TimezoneContext';

interface TimezoneAwareDateFieldProps {
  source: string;
  label?: string;
  showTime?: boolean;
}

export const TimezoneAwareDateField = ({ source, showTime = false }: TimezoneAwareDateFieldProps) => {
  const record = useRecordContext();
  const { formatDate, formatDateTime } = useTimezone();

  if (!record || !record[source]) return null;

  const value = showTime ? formatDateTime(record[source]) : formatDate(record[source]);

  return <Typography variant="body2">{value}</Typography>;
};
