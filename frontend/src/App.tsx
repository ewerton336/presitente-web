import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Home } from './components/Home';
import { Lobby } from './components/Lobby';
import { Game } from './components/Game';
import { JoinDirect } from './components/JoinDirect';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join/:roomId" element={<JoinDirect />} />
          <Route path="/lobby/:roomId" element={<Lobby />} />
          <Route path="/game/:roomId" element={<Game />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

