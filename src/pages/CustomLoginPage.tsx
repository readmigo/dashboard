import { useState } from 'react';
import { useLogin, useNotify, useTranslate } from 'react-admin';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { brandColors, gradients, shadows, textColors, bgColors, alpha } from '../theme/brandTokens';

export const CustomLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useLogin();
  const notify = useNotify();
  const translate = useTranslate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ username: email, password });
    } catch (error) {
      notify(translate('login.error'), { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${alpha(brandColors.blue, 0.08)} 0%, ${alpha(brandColors.purple, 0.08)} 50%, ${alpha(brandColors.pink, 0.08)} 100%)`,
      }}
    >
      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 420,
            p: 4,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(124, 141, 245, 0.15)',
            border: `1px solid ${bgColors.subtle}`,
          }}
        >
          {/* Logo & Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              component="img"
              src="/app-icon.png"
              alt="Readmigo"
              sx={{
                width: 80,
                height: 80,
                borderRadius: 2,
                mb: 2,
                boxShadow: '0 4px 12px rgba(124, 141, 245, 0.2)',
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: gradients.brand,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5,
              }}
            >
              Readmigo
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: textColors.secondary }}
            >
              {translate('login.subtitle')}
            </Typography>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={translate('login.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: textColors.hint }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label={translate('login.password')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: textColors.hint }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOff sx={{ color: textColors.hint }} />
                      ) : (
                        <Visibility sx={{ color: textColors.hint }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                backgroundImage: gradients.brand,
                boxShadow: shadows.brandHover,
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(139, 185, 255, 0.5)',
                },
                '&:disabled': {
                  backgroundImage: 'none',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                translate('login.signIn')
              )}
            </Button>
          </Box>
        </Card>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 3,
          px: 2,
          textAlign: 'center',
          borderTop: `1px solid ${bgColors.subtle}`,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            mb: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="https://readmigo.app"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: textColors.secondary,
              textDecoration: 'none',
              fontSize: '0.875rem',
              '&:hover': { color: brandColors.primary },
            }}
          >
            {translate('login.footer.about')}
          </Link>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Link
            href="https://readmigo.app/privacy"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: textColors.secondary,
              textDecoration: 'none',
              fontSize: '0.875rem',
              '&:hover': { color: brandColors.primary },
            }}
          >
            {translate('login.footer.privacy')}
          </Link>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Link
            href="https://readmigo.app/terms"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: textColors.secondary,
              textDecoration: 'none',
              fontSize: '0.875rem',
              '&:hover': { color: brandColors.primary },
            }}
          >
            {translate('login.footer.terms')}
          </Link>
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: textColors.hint,
            display: 'block',
          }}
        >
          {translate('login.footer.copyright', { year: currentYear })}
        </Typography>
      </Box>
    </Box>
  );
};
