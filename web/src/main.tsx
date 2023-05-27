import React from 'react'
import ReactDOM from 'react-dom/client'
import Table from './components/Table/Table.tsx'
import { ThemeProvider as MuiThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import MUITheme from './utils/MUITheme.ts';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={MUITheme}>
        <Table />
      </MuiThemeProvider>
    </StyledEngineProvider>
  </React.StrictMode>,
)
