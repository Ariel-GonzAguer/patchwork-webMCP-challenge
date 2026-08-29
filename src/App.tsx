import { RouterProvider } from '@arielgonzaguer/michi-router';
import Jardin from './paginas/jardin';
import Calendario from './paginas/calendario';
import Diagnostico from './paginas/diagnostico';
import Aprender from './paginas/aprender';
import { useWebmcp } from './hooks/useWebmcp';
import ScrollAlInicio from './componentes/scroll-al-inicio';

export default function App() {
  useWebmcp();

  return (
    <>
      <ScrollAlInicio />
      <RouterProvider
        routes={[
          { path: '/', component: <Jardin /> },
          { path: '/calendario', component: <Calendario /> },
          { path: '/diagnostico', component: <Diagnostico /> },
          { path: '/aprender', component: <Aprender /> },
        ]}
        notFound={<h1>404 — Page not found</h1>}
      />
    </>
  );
}
