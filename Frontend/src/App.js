import {BrowserRouter, Route, Routes} from 'react-router-dom';
import ShowWifiZones from './components/ShowWifiZones';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ShowWifiZones></ShowWifiZones>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
