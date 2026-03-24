import { ColorModeProvider } from './theme';
import Dashboard from './components/Dashboard';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

function App() {
  return (
    <ColorModeProvider>
      <Dashboard />
    </ColorModeProvider>
  );
}

export default App;
