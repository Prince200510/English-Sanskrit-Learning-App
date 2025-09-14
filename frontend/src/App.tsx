import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Translate from './pages/Translate';
import Flashcards from './pages/Flashcards';
import Grammar from './pages/Grammar';
import { Languages, BookOpen, GraduationCap, Camera, Menu, X } from 'lucide-react';
import ImageRecognition from './pages/ImageRecognition';
import { useState } from 'react';

function NavLink({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon: any }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </Link>
  );
}

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Languages className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Master Languages</span>
          </Link>
          <div className="hidden md:flex items-center space-x-2">
            <NavLink to="/translate" icon={Languages}>Translate</NavLink>
            <NavLink to="/flashcards" icon={BookOpen}>Flashcards</NavLink>
            <NavLink to="/grammar" icon={GraduationCap}>Grammar</NavLink>
            <NavLink to="/image-recognition" icon={Camera}>Image AI</NavLink>
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <NavLink to="/translate" icon={Languages}>Translate</NavLink>
              <NavLink to="/flashcards" icon={BookOpen}>Flashcards</NavLink>
              <NavLink to="/grammar" icon={GraduationCap}>Grammar</NavLink>
              <NavLink to="/image-recognition" icon={Camera}>Image AI</NavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/translate" element={<Translate />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/grammar" element={<Grammar />} />
            <Route path="/image-recognition" element={<ImageRecognition />} />
            <Route path="/image" element={<ImageRecognition />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;