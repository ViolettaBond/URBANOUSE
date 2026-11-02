import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Page/Home/Home';
import Header from './Components/Header/Header';

function App() {
    return (
        <>
            <BrowserRouter>
                <Header />
                <Routes>
                    <Route index path="/" element={<Home />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
