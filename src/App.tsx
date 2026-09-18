import { Route, Routes } from 'react-router-dom';
import { Layout } from './app/Layout';
import { About } from './pages/About';
import { Concepts, ConceptDetail } from './pages/Concepts';
import { ExperimentPage } from './pages/ExperimentPage';
import { Experiments } from './pages/Experiments';
import { Home } from './pages/Home';
import { Laboratory } from './pages/Laboratory';
import { NotFound } from './pages/NotFound';
import { Simulations } from './pages/Simulations';

/**
 * Routes mirror the agreed sitemap: concepts, simulations, experiments and the
 * student's own laboratory. Experiment routes are catalog-driven, so adding an
 * experiment to the registry is the only step needed to make it reachable.
 */
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/concepts" element={<Concepts />} />
        <Route path="/concepts/:slug" element={<ConceptDetail />} />
        <Route path="/simulations" element={<Simulations />} />
        <Route path="/experiments" element={<Experiments />} />
        <Route path="/experiments/:slug" element={<ExperimentPage />} />
        <Route path="/laboratory" element={<Laboratory />} />
        <Route path="/laboratory/history" element={<Laboratory />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
