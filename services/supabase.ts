import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { Amendment, User, SectorConfig, StatusConfig, AuditLog } from '../types';

/**
 * CONFIGURAÇÃO DO CLIENTE SUPABASE
 * Gerencia a comunicação WebSocket e as requisições REST com o backend cloud.
 */
const supabaseUrl = 'https://nisqwvdrbytsdwtlivjl.supabase.co';
const supabaseKey = 'sb_publishable_fcGp4p7EA7gJnyiJJURoZA_HcML_653';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Utilitário para geração de IDs únicos (UUID v4) para novos registros.
 */
export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * TRATAMENTO DE ERROS DE BANCO
 * Converte códigos de erro PostgreSQL em mensagens amigáveis ou exceções controladas.
 */
const handleDbError = (error: any): any => {
  if (error.code === 'PGRST116') return null;
  
  // Erro de coluna ausente ou cache de esquema desatualizado (Comum após migrações)
  if (error.message?.includes('column') && error.message?.includes('not found')) {
    throw new Error(`SCHEMA_MISMATCH: ${error.message}`);
  }

  if (error.code === 'PGRST104' || error.message?.includes('does not exist')) throw new Error('TABLE_MISSING');
  if (error.code === '42501' || error.message?.includes('permission denied')) throw new Error('PERMISSION_DENIED');
  
  throw new Error(`Erro na Base de Dados: ${error.message}`);
};

/**
 * SERVIÇOS DE DADOS (DB WRAPPER)
 * Centraliza as operações de CRUD e Sincronização em tempo real.
 */
export const db = {
  // GESTÃO DE EMENDAS PARLAMENTARES
  amendments: {
    async getAll(tenantId: string): Promise<Amendment[]> {
      const { data, error } = await supabase
        .from('amendments')
        .select('*')
        .eq('tenantId', tenantId) // Filtro de segurança por secretaria
        .order('createdAt', { ascending: false });
      
      if (error) return handleDbError(error);
      return data || [];
    },
    async upsert(amendment: Partial<Amendment>) {
      const payload = {
        ...amendment,
        id: amendment.id || generateUUID(),
        tenantId: amendment.tenantId || 'GOIAS',
        createdAt: amendment.createdAt || new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('amendments')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();
        
      if (error) return handleDbError(error);
      return data;
    },
    async delete(id: string) {
      const { error } = await supabase.from('amendments').delete().eq('id', id);
      if (error) handleDbError(error);
    }
  },

  // GESTÃO DE IDENTIDADES E SERVIDORES
  users: {
    async getAll(tenantId: string): Promise<User[]> {
      const { data, error } = await supabase.from('users').select('*').eq('tenantId', tenantId);
      if (error) return handleDbError(error);
      return data || [];
    },
    async getByEmail(email: string): Promise<User | null> {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
      if (error) return handleDbError(error);
      return data;
    },
    async upsert(user: Partial<User>) {
      const { data, error } = await supabase.from('users').upsert({ ...user, id: user.id || generateUUID() }).select().single();
      if (error) return handleDbError(error);
      return data;
    },
    async delete(id: string) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) handleDbError(error);
    }
  },

  // CONFIGURAÇÃO DE SETORES/UNIDADES
  sectors: {
    async getAll(tenantId: string): Promise<SectorConfig[]> {
      const { data, error } = await supabase.from('sectors').select('*').eq('tenantId', tenantId);
      if (error) return handleDbError(error);
      return data || [];
    },
    async upsert(sector: Partial<SectorConfig>) {
      const { data, error } = await supabase.from('sectors').upsert({ ...sector, id: sector.id || generateUUID() }).select().single();
      if (error) return handleDbError(error);
      return data;
    }
  },

  // CONFIGURAÇÃO DE WORKFLOW/STATUS
  statuses: {
    async getAll(tenantId: string): Promise<StatusConfig[]> {
      const { data, error } = await supabase.from('statuses').select('*').eq('tenantId', tenantId);
      if (error) return handleDbError(error);
      return data || [];
    },
    async upsert(status: Partial<StatusConfig>) {
      const { data, error } = await supabase.from('statuses').upsert({ ...status, id: status.id || generateUUID() }).select().single();
      if (error) return handleDbError(error);
      return data;
    }
  },

  // TRILHA DE AUDITORIA (COMPLIANCE)
  audit: {
    async log(log: Partial<AuditLog>) {
      const { error } = await supabase.from('audit_logs').insert({ 
        ...log, 
        id: generateUUID(), 
        timestamp: new Date().toISOString() 
      });
      if (error) console.warn("Falha ao gravar auditoria na nuvem:", error.message);
    },
    async getAll(tenantId: string): Promise<AuditLog[]> {
      const { data, error } = await supabase.from('audit_logs').select('*').eq('tenantId', tenantId).order('timestamp', { ascending: false });
      if (error) return handleDbError(error);
      return data || [];
    }
  },

  // AUTENTICAÇÃO GERENCIADA
  auth: {
    async signIn(email: string, pass: string) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      return data;
    },
    async updatePassword(newPassword: string) {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return data;
    },
    async signOut() {
      await supabase.auth.signOut();
    }
  }
};