
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nisqwvdrbytsdwtlivjl.supabase.co';
const supabaseKey = 'sb_publishable_fcGp4p7EA7gJnyiJJURoZA_HcML_653';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Função auxiliar para gerar UUID caso o banco não o faça automaticamente
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback simples para ambientes sem randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const db = {
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
            tenantId: 'T-01'
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
    async update(id: string, updates: any) {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    async rotateApiKey(id: string) {
      const newKey = `gesa_live_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
      const { error } = await supabase
        .from('profiles')
        .update({ api_key: newKey })
        .eq('id', id);
      if (error) throw error;
      return newKey;
    }
  },
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
      
      return (data || []).map(a => ({
        ...a,
        movements: Array.isArray(a.movements) ? a.movements : []
      }));
    },
    async upsert(amendment: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada. Por favor, faça login novamente.');

      // Prepara o objeto garantindo o tenantId do usuário logado e saneamento de movimentos
      const sanitizedAmendment = {
        ...amendment,
        tenantId: user.user_metadata.tenantId || amendment.tenantId || 'T-01',
        movements: Array.isArray(amendment.movements) ? amendment.movements : []
      };

      // CORREÇÃO DE INTEGRIDADE: Se for um ID temporário, geramos um UUID real.
      // O banco de dados rejeita inserções se a coluna 'id' for PK e estiver nula sem gerador default.
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
        // Tradução de erro comum do Postgres para o usuário
        if (error.code === '23502') {
          throw new Error('Falha no Banco: O campo "id" é obrigatório e não pôde ser gerado. Contate o suporte técnico.');
        }
        throw new Error(`Erro ao salvar no banco: ${error.message}`);
      }
      
      return data[0];
    }
  },
  audit: {
    async getLogs(tenantId: string) {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('tenantId', tenantId)
        .order('timestamp', { ascending: false })
        .limit(100);
        
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
