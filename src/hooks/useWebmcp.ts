import { useEffect } from 'react';
import { registrarToolsWebmcp, webmcpDisponible } from '../webmcp/registrarTools';

/**
 * Registra los tools WebMCP una sola vez al montar la app.
 * Sin WebMCP disponible no hace nada (progressive enhancement).
 */
export function useWebmcp() {
  useEffect(() => {
    if (!webmcpDisponible()) return;
    void registrarToolsWebmcp();
  }, []);
}
