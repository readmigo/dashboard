import { Box, Typography, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useTimezone, TIMEZONE_OPTIONS } from '../contexts/TimezoneContext';

export const TimezoneSelector = () => {
  const { timezone, setTimezone } = useTimezone();

  const handleChange = (event: SelectChangeEvent<string>) => {
    setTimezone(event.target.value);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 1 }}>
      <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
      <Select
        value={timezone}
        onChange={handleChange}
        size="small"
        variant="standard"
        disableUnderline
        sx={{
          fontSize: '0.75rem',
          color: 'text.secondary',
          '& .MuiSelect-select': {
            py: 0,
            pr: 2,
          },
          '& .MuiSvgIcon-root': {
            fontSize: 16,
          },
        }}
      >
        {TIMEZONE_OPTIONS.map((tz) => (
          <MenuItem key={tz.id} value={tz.id}>
            <Typography variant="body2" component="span">
              {tz.label}
            </Typography>
            <Typography
              variant="caption"
              component="span"
              sx={{ ml: 0.5, color: 'text.disabled' }}
            >
              ({tz.offset})
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};
