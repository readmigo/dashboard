import { useState, useMemo } from 'react';
import { useTranslate } from 'react-admin';
import { Box, Tabs, Tab } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { DailyReportView } from './DailyReportView';
import { DailyReportTrendsView } from './DailyReportTrendsView';

type TabKey = 'view' | 'trend';

export function DailyReportPage() {
  const translate = useTranslate();
  const location = useLocation();
  const navigate = useNavigate();

  const initialTab: TabKey = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') === 'trend' ? 'trend' : 'view';
  }, [location.search]);

  const [tab, setTab] = useState<TabKey>(initialTab);

  const handleChange = (_: React.SyntheticEvent, value: TabKey) => {
    setTab(value);
    const params = new URLSearchParams(location.search);
    params.set('tab', value);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 1.5, sm: 2, md: 3 }, pt: { xs: 1, sm: 1.5 } }}>
        <Tabs
          value={tab}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            value="view"
            icon={<VisibilityIcon fontSize="small" />}
            iconPosition="start"
            label={translate('dailyReportView.tab.view', { _: '日报查阅' })}
          />
          <Tab
            value="trend"
            icon={<TrendingUpIcon fontSize="small" />}
            iconPosition="start"
            label={translate('dailyReportView.tab.trend', { _: '趋势预测' })}
          />
        </Tabs>
      </Box>
      {tab === 'view' ? <DailyReportView /> : <DailyReportTrendsView />}
    </Box>
  );
}
