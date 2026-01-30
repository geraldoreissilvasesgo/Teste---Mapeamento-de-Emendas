
import { User, Role } from '../types';

/**
 * SERVIÇO DE INFRAESTRUTURA (API MOCK)
 * Mantém apenas dados de sessão e monitoramento básico.
 */
class GESA_API_Service {
  private _currentUser: User | null = null;

  public setSession(user: User | null) {
    this._currentUser = user;
  }

  public getSession() {
    return this._currentUser;
  }

  /**
   * Status simplificado para o painel técnico.
   */
  getSystemHealth() {
    return {
      status: 'Operacional',
      uptime: '99.9%',
      latency: '24ms',
      lastSync: new Date().toISOString()
    };
  }
}

export const apiService = new GESA_API_Service();
