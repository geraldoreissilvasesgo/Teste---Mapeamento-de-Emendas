
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

// Helper para obter o tenant atual de forma segura (Auth real ou Fallback demo)
const getEffectiveTenant = async (providedTenantId?: string) => {
  if (providedTenantId && providedTenantId !== 'temp-id') return providedTenantId;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.user_metadata?.tenantId || 'GOIAS';
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

  users: {
    async getAll(tenantId: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('tenantId', tenantId)
        .order('name', { ascending: true });
      
      if (error) {
        if (error.code === 'PGRST104' || error.message.includes('public.users')) {
          throw new Error('TABLE_MISSING');
        }
        throw error;
      }
      return data || [];
    },
    async upsert(user: any) {
      const tenantId = await getEffectiveTenant(user.tenantId);
      
      const payload = { 
        id: (user.id && !user.id.startsWith('u-')) ? user.id : generateUUID(),
        tenantId,
        name: user.name,
        email: user.email,
        role: user.role,
        password: user.password,
        department: user.department,
        avatarUrl: user.avatarUrl,
        lgpdAccepted: user.lgpdAccepted || false,
        mfaEnabled: user.mfaEnabled || false,
        createdAt: user.createdAt || new Date().toISOString()
      };
      
      const { data, error } = await supabase.from('users').upsert(payload).select();
      if (error) throw error;
      return data[0];
    },
    async delete(id: string) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
    }
  },

  profiles: {
    async get(id: string) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
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
      const tenantId = await getEffectiveTenant(sector.tenantId);
      const payload = { 
        ...sector, 
        tenantId,
        id: (sector.id && sector.id.length > 10) ? sector.id : generateUUID()
      };
      const { data, error } = await supabase.from('sectors').upsert(payload).select();
      if (error) throw error;
      return data[0];
    },
    async insertMany(sectors: any[]) {
      const tenantId = await getEffectiveTenant();
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
      const tenantId = await getEffectiveTenant(status.tenantId);
      const payload = { 
        ...status, 
        tenantId,
        id: (status.id && status.id.length > 10) ? status.id : generateUUID()
      };
      const { data, error } = await supabase.from('statuses').upsert(payload).select();
      if (error) throw error;
      return data[0];
    },
    async insertMany(statuses: any[]) {
      const tenantId = await getEffectiveTenant();
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
      const { data, error } = await supabase
        .from('amendments')
        .select('*')
        .eq('tenantId', tenantId)
        .order('createdAt', { ascending: false });
      
      if (error) {
        if (error.code === 'PGRST104' || error.message.includes('public.amendments')) {
          throw new Error('TABLE_MISSING');
        }
        throw error;
      }
      return data || [];
    },
    async upsert(amendment: any) {
      const tenantId = await getEffectiveTenant(amendment.tenantId);
      // Se o ID for de mock (ex: a-01), tentamos encontrar se ele já existe pelo número SEI antes de gerar novo UUID
      let finalId = amendment.id;
      
      if (!finalId || finalId.startsWith('a-') || finalId.startsWith('temp-')) {
        const { data: existing } = await supabase
          .from('amendments')
          .select('id')
          .eq('seiNumber', amendment.seiNumber)
          .eq('tenantId', tenantId)
          .maybeSingle();
        
        finalId = existing ? existing.id : generateUUID();
      }

      const payload = { 
        ...amendment, 
        id: finalId,
        tenantId 
      };

      const { data, error } = await supabase.from('amendments').upsert(payload).select();
      if (error) throw error;
      return data[0];
    },
    async insertMany(amendments: any[]) {
      const tenantId = await getEffectiveTenant();
      const payload = amendments.map(a => ({
        ...a,
        id: (a.id && !a.id.startsWith('imp-') && !a.id.startsWith('a-')) ? a.id : generateUUID(),
        tenantId,
        createdAt: a.createdAt || new Date().toISOString()
      }));
      const { data, error } = await supabase.from('amendments').insert(payload).select();
      if (error) throw error;
      return data;
    }
  },

  audit: {
    async log(log: any) {
      const tenantId = await getEffectiveTenant(log.tenantId);
      const { data: { user } } = await supabase.auth.getUser();
      
      const payload = {
        ...log,
        id: generateUUID(),
        tenantId,
        actorId: user?.id || log.actorId || 'demo-actor',
        actorName: user?.user_metadata?.name || log.actorName || 'Servidor GESA',
        timestamp: new Date().toISOString()
      };
      const { error } = await supabase.from('audit_logs').insert(payload);
      if (error) console.error("Audit log error:", error);
    },
    async getLogs(tenantId: string) {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('tenantId', tenantId)
        .order('timestamp', { ascending: false })
        .limit(500);
      
      if (error) {
        if (error.code === 'PGRST104' || error.message.includes('public.audit_logs')) {
          throw new Error('TABLE_MISSING');
        }
        throw error;
      }
      return data || [];
    }
  }
};
