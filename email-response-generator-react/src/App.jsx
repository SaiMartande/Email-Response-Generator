import React, { useState, useMemo } from 'react';
import {
  Container,
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Snackbar,
  CssBaseline,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LightMode, DarkMode } from '@mui/icons-material';
import axios from 'axios';
import './App.css';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generateReply, setGenerateReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false); // Snackbar state

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8080/api/email/generate', {
        emailContent,
        tone,
      });

      setGenerateReply(typeof response.data === 'string' ? response.data : JSON.stringify(response.data));
    } catch (error) {
      setError('🚫 Failed to generate email reply. Please check your server and try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateReply);
    setCopySuccess(true);
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Theme Toggle Button */}
      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 999 }}>
        <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
          {darkMode ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', color: 'primary.main', textAlign: 'center' }}
        >
          📬 Email Reply Generator
        </Typography>

        <Box sx={{ mx: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            label="Original Email Content"
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
          />

          <FormControl fullWidth>
            <InputLabel>Tone (Optional)</InputLabel>
            <Select
              value={tone || ''}
              label="Tone (Optional)"
              onChange={(e) => setTone(e.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="professional">Professional</MenuItem>
              <MenuItem value="casual">Casual</MenuItem>
              <MenuItem value="friendly">Friendly</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!emailContent || loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Reply'}
          </Button>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {generateReply && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Generated Reply:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                value={generateReply || ''}
                inputProps={{ readOnly: true }}
              />
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={handleCopy}
              >
                Copy to Clipboard
              </Button>
            </Box>
          )}
        </Box>
      </Container>

      {/* Snackbar for copy confirmation */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        message="Reply copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </ThemeProvider>
  );
}

export default App;
