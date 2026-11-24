import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Footer from './Components/Footer/Footer';
import Header from './Components/Header/Header';
import ProtectedRoute from './Components/ProtectedRoute';
import ScrollToTop from './Components/ScrollToTop';
import SignIn from './Components/SignIn/SignIn';
import SignUp from './Components/SignUp/SignUp';
import AboutUs from './Page/AboutUs/AboutUs';
import Account from './Page/Account/Account';
import Admin from './Page/Admin/Admin';
import Agents from './Page/Agents/Agents';
import Contacts from './Page/Contacts/Contacts';
import Favorites from './Page/Favorites/Favorites';
import Home from './Page/Home/Home';
import NotFound from './Page/NotFound/NotFound';
import Projects from './Page/Projects/Projects';
import Properties from './Page/Properties/Properties';
import PropertyDetails from './Page/Properties/PropertyDetails';
import PropertyList from './Page/Properties/PropertyList';

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/properties" element={<Properties />} />
                    <Route path="/properties/list" element={<PropertyList />} />
                    <Route path="/properties/:id" element={<PropertyDetails />} />
                    <Route path="/agents" element={<Agents />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />

                    <Route
                        path="/favorites"
                        element={
                            <ProtectedRoute>
                                <Favorites />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/account"
                        element={
                            <ProtectedRoute>
                                <Account />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute admin>
                                <Admin />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            <Footer />
        </BrowserRouter>
    );
}

export default App;
