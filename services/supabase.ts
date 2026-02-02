
import { createClient } from '@supabase/supabase-js';

/**
 * CONFIGURAÇÃO DO SUPABASE
 * Gerencia a conexão com o backend as-a-service, incluindo autenticação,
 * banco de dados Postgres e políticas de segurança RLS (Row Level Security).
 */
const supabaseUrl = 'https://nisqwvdrbytsdwtlivjl.supabase.co';
const supabaseKey = 'sb_publishable_fcGp4p7EA7gJnyiJJURoZA_HcML_653';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Função utilitária para gerar identificadores únicos (UUID) para novos registros.
 */
const generateUUID = () => {
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
 * ABSTRAÇÃO DO BANCO DE DADOS (DB WRAPPER)
 * Centraliza as chamadas de API para facilitar a manutenção e garantir
 * que as regras de SaaS (isolamento por tenantId) sejam aplicadas.
 */
export const db = {
  // --- MÓDULO DE AUTENTICAÇÃO ---
  auth: {
    async signIn(email: string, pass: string) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) throw error;
      return data;
    },
    async signUp(email: string, pass: string, name: string) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            name: name,
            role: 'Administrador de Unidade',
            tenantId: 'T-01' // Tenant padrão inicial
          }
        }
      });
      if (error) throw error;
      return data;
    },
    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
  },

  // --- MÓDULO DE PERFIS DE USUÁRIO (RBAC) ---
  profiles: {
    async get(id: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    async getAll(tenantId: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('tenantId', tenantId);
      if (error) throw error;
      return data || [];
    },
    async rotateApiKey(id: string) {
      // Gera uma nova chave de API para integrações externas
      const newKey = `gesa_live_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
      const { error } = await supabase
        .from('profiles')
        .update({ api_key: newKey })
        .eq('id', id);
      if (error) throw error;
      return newKey;
    }
  },

  // --- MÓDULO DE EMENDAS E PROCESSOS (CORE) ---
  amendments: {
    async getAll(tenantId: string) {
      const { data, error } = await supabase
        .from('amendments')
        .select('*')
        .eq('tenantId', tenantId)
        .order('createdAt', { ascending: false });
        
      if (error) {
        if (error.code === '42501') throw new Error('Acesso negado: Violação de política RLS detectada.');
        throw error;
      }
      
      // Garante que o campo movements seja sempre um array para evitar quebras na UI
      return (data || []).map(a => ({
        ...a,
        movements: Array.isArray(a.movements) ? a.movements : []
      }));
    },
    async upsert(amendment: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada. Por favor, faça login novamente.');

      const sanitizedAmendment = {
        ...amendment,
        tenantId: user.user_metadata.tenantId || amendment.tenantId || 'T-01',
        movements: Array.isArray(amendment.movements) ? amendment.movements : []
      };

      // Gerenciamento de IDs para novos registros (SaaS isolation)
      const idStr = String(sanitizedAmendment.id || '');
      const isNewRecord = idStr.startsWith('temp-') || idStr.startsWith('imp-') || !sanitizedAmendment.id;

      if (isNewRecord) {
        sanitizedAmendment.id = generateUUID();
      }

      const { data, error } = await supabase
        .from('amendments')
        .upsert(sanitizedAmendment)
        .select();
        
      if (error) {
        console.error('Erro de persistência:', error);
        throw new Error(`Erro ao salvar no banco: ${error.message}`);
      }
      
      return data[0];
    }
  },

  // --- MÓDULO DE AUDITORIA (COMPLIANCE) ---
  audit: {
    async getLogs(tenantId: string) {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('tenantId', tenantId)
        .order('timestamp', { ascending: false })
        .limit(200); // Retorna os últimos 200 eventos
        
      if (error) throw error;
      return data || [];
    },
    async log(entry: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('audit_logs')
        .insert({
          ...entry,
          tenantId: user.user_metadata.tenantId || 'T-01',
          actorId: user.id,
          actorName: user.user_metadata.name || user.email,
          timestamp: new Date().toISOString()
        });
        
      if (error) console.error('Falha na auditoria:', error.message);
    }
  }
};
