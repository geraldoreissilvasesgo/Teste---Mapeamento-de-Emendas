
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { Amendment, User, SectorConfig, StatusConfig, AuditLog } from '../types';

/**
 * CONFIGURAÇÃO DO CLIENTE SUPABASE - GESA CLOUD NATIVE
 * Conexão com as credenciais fornecidas: https://nisqwvdrbytsdwtlivjl.supabase.co
 */
const supabaseUrl = 'https://nisqwvdrbytsdwtlivjl.supabase.co';
const supabaseKey = 'sb_publishable_fcGp4p7EA7gJnyiJJURoZA_HcML_653';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Utilitário de ID único compatível com UUID v4.
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
 * Tratamento centralizado de erros de banco de dados.
 */
const handleDbError = (error: any) => {
  if (error.message && error.message.startsWith('DB_ERROR')) {
    throw error;
  }

  console.group("🔴 Database Error Trace");
  console.error("Code:", error.code);
  console.error("Message:", error.message);
  console.groupEnd();

  if (error.code === 'PGRST116') return null;

  if (error.code === 'PGRST104' || error.message?.includes('does not exist')) {
    throw new Error('TABLE_MISSING');
  }
  
  if (error.code === '42501' || error.message?.includes('permission denied')) {
    throw new Error('PERMISSION_DENIED');
  }

  if (error.message?.includes('Invalid API key')) {
    throw new Error('DB_ERROR: Chave de API Supabase Inválida.');
  }
  
  throw new Error(`DB_ERROR: ${error.message || 'Erro desconhecido no banco'}`);
};

export const db = {
  amendments: {
    async getAll(tenantId: string): Promise<Amendment[]> {
      const { data, error } = await supabase
        .from('amendments')
        .select('*')
        .eq('tenantId', tenantId)
        .order('createdAt', { ascending: false });
      
      if (error) {
        handleDbError(error);
        return [];
      }
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
    async insertMany(items: any[]) {
      const formattedItems = items.map(item => ({
        ...item,
        id: item.id || generateUUID(),
        tenantId: item.tenantId || 'GOIAS',
        createdAt: item.createdAt || new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('amendments')
        .insert(formattedItems)
        .select();

      if (error) return handleDbError(error);
      return data;
    },
    subscribe(tenantId: string, callback: (payload: any) => void): RealtimeChannel {
      return supabase
        .channel(`public:amendments:tenant:${tenantId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'amendments' }, callback)
        .subscribe();
    }
  },
  users: {
    async getAll(tenantId: string): Promise<User[]> {
      const { data, error } = await supabase.from('users').select('*').eq('tenantId', tenantId);
      if (error) {
        handleDbError(error);
        return [];
      }
      return data || [];
    },
    async upsert(user: Partial<User>) {
      const { data, error } = await supabase
        .from('users')
        .upsert({ ...user, id: user.id || generateUUID() })
        .select()
        .single();
      if (error) return handleDbError(error);
      return data;
    },
    async delete(id: string) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) return handleDbError(error);
    }
  },
  profiles: {
    async get(id: string) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (error) return null;
      return data;
    }
  },
  sectors: {
    async getAll(tenantId: string): Promise<SectorConfig[]> {
      const { data, error } = await supabase.from('sectors').select('*').eq('tenantId', tenantId);
      if (error) {
        handleDbError(error);
        return [];
      }
      return data || [];
    },
    async upsert(sector: Partial<SectorConfig>) {
      const { data, error } = await supabase.from('sectors').upsert({ ...sector, id: sector.id || generateUUID() }).select().single();
      if (error) return handleDbError(error);
      return data;
    }
  },
  statuses: {
    async getAll(tenantId: string): Promise<StatusConfig[]> {
      const { data, error } = await supabase.from('statuses').select('*').eq('tenantId', tenantId);
      if (error) {
        handleDbError(error);
        return [];
      }
      return data || [];
    },
    async upsert(status: Partial<StatusConfig>) {
      const { data, error } = await supabase.from('statuses').upsert({ ...status, id: status.id || generateUUID() }).select().single();
      if (error) return handleDbError(error);
      return data;
    }
  },
  audit: {
    async log(log: Partial<AuditLog>) {
      const { error } = await supabase.from('audit_logs').insert({ 
        ...log, 
        id: generateUUID(), 
        timestamp: new Date().toISOString() 
      });
      if (error) console.warn("Audit Log sync skipped:", error.message);
    },
    async getAll(tenantId: string): Promise<AuditLog[]> {
      const { data, error } = await supabase.from('audit_logs').select('*').eq('tenantId', tenantId).order('timestamp', { ascending: false });
      if (error) {
        handleDbError(error);
        return [];
      }
      return data || [];
    }
  },
  auth: {
    async signIn(email: string, pass: string) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      return data;
    }
  }
};
