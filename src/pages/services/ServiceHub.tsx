import { useTranslate } from 'react-admin';
import {
  Box,
  CardContent,
  CardActionArea,
  Typography,
  Grid,
  Chip,
  Card,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LanguageIcon from '@mui/icons-material/Language';
import StorageIcon from '@mui/icons-material/Storage';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import BuildIcon from '@mui/icons-material/Build';
import CloudIcon from '@mui/icons-material/Cloud';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import type { ReactNode } from 'react';
import { brandColors, semanticColors, textColors, bgColors, alpha } from '../../theme/brandTokens';

interface ServiceItem {
  nameKey: string;
  descKey: string;
  url: string;
  category: 'web' | 'backend' | 'app' | 'tool' | 'ops';
  techStack: string;
}

const services: ServiceItem[] = [
  // Web Frontend
  {
    nameKey: 'services.items.web.name',
    descKey: 'services.items.web.desc',
    url: 'https://web.readmigo.app',
    category: 'web',
    techStack: 'Next.js',
  },
  {
    nameKey: 'services.items.contentStudio.name',
    descKey: 'services.items.contentStudio.desc',
    url: 'https://studio.readmigo.app',
    category: 'web',
    techStack: 'Next.js',
  },
  {
    nameKey: 'services.items.aiTechReview.name',
    descKey: 'services.items.aiTechReview.desc',
    url: 'https://ai.readmigo.app',
    category: 'web',
    techStack: 'Next.js 16 + React 19',
  },
  {
    nameKey: 'services.items.rssReader.name',
    descKey: 'services.items.rssReader.desc',
    url: 'https://rss.mcloud88.com',
    category: 'web',
    techStack: 'Vite + React 19 + MUI',
  },
  {
    nameKey: 'services.items.blog.name',
    descKey: 'services.items.blog.desc',
    url: 'https://blog.readmigo.app',
    category: 'web',
    techStack: 'Hugo + PaperMod',
  },
  {
    nameKey: 'services.items.website.name',
    descKey: 'services.items.website.desc',
    url: 'https://readmigo.app',
    category: 'web',
    techStack: 'Static HTML/CSS/JS',
  },
  {
    nameKey: 'services.items.docs.name',
    descKey: 'services.items.docs.desc',
    url: 'https://docs.readmigo.app',
    category: 'web',
    techStack: 'VitePress + CF Workers',
  },
  // Backend
  {
    nameKey: 'services.items.api.name',
    descKey: 'services.items.api.desc',
    url: 'https://api.readmigo.app',
    category: 'backend',
    techStack: 'NestJS + TypeScript',
  },
  {
    nameKey: 'services.items.gutenberg.name',
    descKey: 'services.items.gutenberg.desc',
    url: 'https://gutenberg-api.readmigo.workers.dev',
    category: 'backend',
    techStack: 'CF Workers + Hono + D1',
  },
  {
    nameKey: 'services.items.nlp.name',
    descKey: 'services.items.nlp.desc',
    url: '',
    category: 'backend',
    techStack: 'Python FastAPI + spaCy',
  },
  {
    nameKey: 'services.items.tts.name',
    descKey: 'services.items.tts.desc',
    url: '',
    category: 'backend',
    techStack: 'Kokoro TTS + CUDA',
  },
  // Apps
  {
    nameKey: 'services.items.ios.name',
    descKey: 'services.items.ios.desc',
    url: 'https://github.com/readmigo/ios',
    category: 'app',
    techStack: 'Swift + Xcode',
  },
  {
    nameKey: 'services.items.android.name',
    descKey: 'services.items.android.desc',
    url: 'https://github.com/readmigo/android',
    category: 'app',
    techStack: 'Kotlin + Gradle',
  },
  {
    nameKey: 'services.items.flutter.name',
    descKey: 'services.items.flutter.desc',
    url: 'https://github.com/readmigo/flutter',
    category: 'app',
    techStack: 'Flutter + Dart',
  },
  {
    nameKey: 'services.items.mobile.name',
    descKey: 'services.items.mobile.desc',
    url: 'https://github.com/readmigo/mobile',
    category: 'app',
    techStack: 'React Native + Expo',
  },
  // Tools
  {
    nameKey: 'services.items.typesetting.name',
    descKey: 'services.items.typesetting.desc',
    url: 'https://github.com/readmigo/typesetting',
    category: 'tool',
    techStack: 'C++ 17 + CMake',
  },
  {
    nameKey: 'services.items.readerEngine.name',
    descKey: 'services.items.readerEngine.desc',
    url: 'https://github.com/readmigo/reader-engine',
    category: 'tool',
    techStack: 'TypeScript + CSS',
  },
  {
    nameKey: 'services.items.audiolab.name',
    descKey: 'services.items.audiolab.desc',
    url: 'https://github.com/readmigo/audiolab',
    category: 'tool',
    techStack: 'TypeScript + AI TTS',
  },
  // Ops
  {
    nameKey: 'services.items.droplet.name',
    descKey: 'services.items.droplet.desc',
    url: 'http://mcloud88.com',
    category: 'ops',
    techStack: 'Shell Scripts',
  },
  {
    nameKey: 'services.items.posthog.name',
    descKey: 'services.items.posthog.desc',
    url: 'https://us.posthog.com/project/312868/dashboard/1276265',
    category: 'ops',
    techStack: 'PostHog Cloud',
  },
];

const categoryConfig: Record<string, { icon: ReactNode; color: string; labelKey: string }> = {
  web: { icon: <LanguageIcon />, color: semanticColors.success, labelKey: 'services.categories.web' },
  backend: { icon: <StorageIcon />, color: semanticColors.info, labelKey: 'services.categories.backend' },
  app: { icon: <PhoneIphoneIcon />, color: semanticColors.warning, labelKey: 'services.categories.app' },
  tool: { icon: <BuildIcon />, color: brandColors.accentPurple, labelKey: 'services.categories.tool' },
  ops: { icon: <CloudIcon />, color: textColors.secondary, labelKey: 'services.categories.ops' },
};

const categoryOrder = ['web', 'backend', 'app', 'tool', 'ops'] as const;

export const ServiceHub = () => {
  const translate = useTranslate();

  const groupedServices = categoryOrder.map((cat) => ({
    category: cat,
    ...categoryConfig[cat],
    items: services.filter((s) => s.category === cat),
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 600 }}>
        {translate('services.title')}
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: textColors.secondary }}>
        {translate('services.subtitle')}
      </Typography>

      {groupedServices.map((group) => (
        <Box key={group.category} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ color: group.color, display: 'flex' }}>{group.icon}</Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {translate(group.labelKey)}
            </Typography>
            <Chip
              label={group.items.length}
              size="small"
              sx={{ height: 20, fontSize: 12, backgroundColor: alpha(group.color, 0.12), color: group.color, fontWeight: 600 }}
            />
          </Box>
          <Grid container spacing={2}>
            {group.items.map((service) => {
              const hasUrl = Boolean(service.url);
              const cardContent = (
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                      {translate(service.nameKey)}
                    </Typography>
                    {hasUrl ? (
                      <OpenInNewIcon sx={{ fontSize: 16, color: group.color, flexShrink: 0 }} />
                    ) : (
                      <LinkOffIcon sx={{ fontSize: 16, color: textColors.hint, flexShrink: 0 }} />
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ color: textColors.secondary, mb: 2, flex: 1 }}>
                    {translate(service.descKey)}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={service.techStack}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: 11, borderColor: alpha(group.color, 0.3), color: textColors.secondary }}
                    />
                    {hasUrl && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: group.color, fontSize: 12, fontWeight: 500 }}>
                        {translate('services.open', { _: 'Open' })}
                        <ArrowForwardIcon sx={{ fontSize: 14 }} />
                      </Box>
                    )}
                  </Box>
                </CardContent>
              );

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={service.nameKey}>
                  <Card
                    sx={{
                      height: '100%',
                      borderLeft: `3px solid ${hasUrl ? group.color : bgColors.subtle}`,
                      transition: 'all 0.2s ease',
                      cursor: hasUrl ? 'pointer' : 'default',
                      opacity: hasUrl ? 1 : 0.65,
                      '&:hover': hasUrl ? {
                        boxShadow: `0 4px 16px ${alpha(group.color, 0.2)}`,
                        borderLeftColor: group.color,
                        transform: 'translateY(-2px)',
                      } : {},
                    }}
                  >
                    {hasUrl ? (
                      <CardActionArea
                        component="a"
                        href={service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                      >
                        {cardContent}
                      </CardActionArea>
                    ) : (
                      cardContent
                    )}
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};
