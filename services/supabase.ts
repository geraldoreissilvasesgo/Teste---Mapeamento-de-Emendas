
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nisqwvdrbytsdwtlivjl.supabase.co';
const supabaseKey = 'sb_publishable_fcGp4p7EA7gJnyiJJURoZA_HcML_653';

export const supabase = createClient(supabaseUrl, supabaseKey);

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
      return data || [];
    },
    async upsert(amendment: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada ou inválida. Por favor, faça login novamente.');

      // Garante que o tenantId sempre venha do perfil do usuário para respeitar o RLS
      const sanitizedAmendment = {
        ...amendment,
        tenantId: user.user_metadata.tenantId || amendment.tenantId
      };

      // Remove IDs temporários de mock para permitir que o banco gere UUIDs se necessário
      if (typeof sanitizedAmendment.id === 'string' && sanitizedAmendment.id.startsWith('imp-')) {
        delete sanitizedAmendment.id;
      }

      const { data, error } = await supabase
        .from('amendments')
        .upsert(sanitizedAmendment, { onConflict: 'seiNumber' }) // Evita duplicidade por número SEI
        .select();
        
      if (error) {
        console.error('Erro de persistência Supabase:', error);
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
          timestamp: new Date().toISOString()
        });
        
      if (error) console.error('Falha crítica de auditoria:', error.message);
    }
  }
};
