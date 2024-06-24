import "../styles/global.css"
import type { AppProps } from 'next/app';
import { FileProvider } from '../context/FileContext';


function App({ Component, pageProps }: AppProps) {
  return (
    <FileProvider>
      <Component {...pageProps} />
    </FileProvider>
  );
}

export default App;
