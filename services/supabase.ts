
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nisqwvdrbytsdwtlivjl.supabase.co';
const supabaseKey = 'sb_publishable_fcGp4p7EA7gJnyiJJURoZA_HcML_653';

export const supabase = createClient(supabaseUrl, supabaseKey);

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

export const db = {
  auth: {
    async signIn(email: string, pass: string) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      return data;
    },
    async signUp(email: string, pass: string, name: string, role: string, tenantId: string, department?: string) {
      const { data, error } = await supabase.auth.signUp({
        email, 
        password: pass,
        options: { 
          data: { 
            name, 
            role, 
            tenantId,
            department: department || 'GESA/SUBIPEI',
            lgpdAccepted: false 
          } 
        }
      });
      if (error) throw error;
      return data;
    },
    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onAuthStateChange(callback: any) {
      return supabase.auth.onAuthStateChange(callback);
    }
  },

  profiles: {
    async get(id: string) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    async getAll(tenantId: string) {
      // Nota: Em produção real, buscaríamos de uma tabela 'profiles' sincronizada.
      // Para este protótipo robusto, simulamos a listagem de usuários baseada nos logs de acesso recentes.
      const { data, error } = await supabase.from('audit_logs').select('actorId, actorName').eq('tenantId', tenantId);
      if (error) return [];
      
      const uniqueUsers = Array.from(new Set(data.map(d => d.actorId))).map(id => {
        const user = data.find(d => d.actorId === id);
        return {
          id,
          name: user.actorName,
          email: `${user.actorId.substring(0,5)}@goias.gov.br`,
          role: 'Operador GESA',
          lgpdAccepted: true,
          department: 'SES/SUBIPEI'
        };
      });
      return uniqueUsers;
    },
    async rotateApiKey(id: string) {
      const newKey = `gesa_live_${Math.random().toString(36).substring(2, 15)}`;
      const { error } = await supabase.from('profiles').update({ api_key: newKey }).eq('id', id);
      if (error) throw error;
      return newKey;
    }
  },

  sectors: {
    async getAll(tenantId: string) {
      const { data, error } = await supabase.from('sectors').select('*').eq('tenantId', tenantId).order('name', { ascending: true });
      if (error) {
        if (error.code === 'PGRST104' || error.message.includes('public.sectors')) {
          throw new Error('TABLE_MISSING');
        }
        throw error;
      }
      return data || [];
    },
    async upsert(sector: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const payload = { 
        ...sector, 
        tenantId: user.user_metadata.tenantId || sector.tenantId || 'T-01' 
      };
      if (!payload.id || typeof payload.id !== 'string' || payload.id.length < 10) {
        payload.id = generateUUID();
      }
      const { data, error } = await supabase.from('sectors').upsert(payload).select();
      if (error) throw error;
      return data[0];
    },
    async insertMany(sectors: any[]) {
      const { data: { user } } = await supabase.auth.getUser();
      const tenantId = user?.user_metadata.tenantId || 'T-01';
      const payload = sectors.map(s => ({ 
        ...s, 
        id: generateUUID(), 
        tenantId 
      }));
      const { data, error } = await supabase.from('sectors').insert(payload).select();
      if (error) throw error;
      return data;
    }
  },

  statuses: {
    async getAll(tenantId: string) {
      const { data, error } = await supabase.from('statuses').select('*').eq('tenantId', tenantId).order('name', { ascending: true });
      if (error) {
        if (error.code === 'PGRST104' || error.message.includes('public.statuses')) {
          throw new Error('TABLE_MISSING');
        }
        throw error;
      }
      return data || [];
    },
    async upsert(status: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const payload = { 
        ...status, 
        tenantId: user.user_metadata.tenantId || status.tenantId || 'T-01' 
      };
      if (!payload.id || typeof payload.id !== 'string' || payload.id.length < 10) {
        payload.id = generateUUID();
      }
      const { data, error } = await supabase.from('statuses').upsert(payload).select();
      if (error) throw error;
      return data[0];
    },
    async insertMany(statuses: any[]) {
      const { data: { user } } = await supabase.auth.getUser();
      const tenantId = user?.user_metadata.tenantId || 'T-01';
      const payload = statuses.map(s => ({ 
        ...s, 
        id: generateUUID(), 
        tenantId 
      }));
      const { data, error } = await supabase.from('statuses').insert(payload).select();
      if (error) throw error;
      return data;
    },
    async resetToEmpty(tenantId: string) {
      const { error } = await supabase.from('statuses').delete().eq('tenantId', tenantId);
      if (error) throw error;
    }
  },

  amendments: {
    async getAll(tenantId: string) {
      const { data, error } = await supabase.from('amendments').select('*').eq('tenantId', tenantId).order('createdAt', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async upsert(amendment: any) {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { 
        ...amendment, 
        tenantId: user?.user_metadata.tenantId || amendment.tenantId || 'T-01' 
      };
      if (!payload.id || typeof payload.id !== 'string' || payload.id.startsWith('temp-')) {
        payload.id = generateUUID();
      }
      const { data, error } = await supabase.from('amendments').upsert(payload).select();
      if (error) throw error;
      return data[0];
    }
  },

  audit: {
    async log(log: any) {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        ...log,
        id: generateUUID(),
        tenantId: user?.user_metadata.tenantId || log.tenantId || 'T-01',
        actorId: user?.id || log.actorId || 'system',
        actorName: user?.user_metadata.name || log.actorName || 'Sistema',
        timestamp: new Date().toISOString()
      };
      const { error } = await supabase.from('audit_logs').insert(payload);
      if (error) console.error("Audit log error:", error);
    },
    async getLogs(tenantId: string) {
      const { data, error } = await supabase.from('audit_logs').select('*').eq('tenantId', tenantId).order('timestamp', { ascending: false }).limit(500);
      if (error) return [];
      return data || [];
    }
  }
};
