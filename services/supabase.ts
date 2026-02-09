
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { Amendment, User, SectorConfig, StatusConfig, AuditLog } from '../types';

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

const handleDbError = (error: any): any => {
  if (error.code === 'PGRST116') return null;
  if (error.code === 'PGRST104' || error.message?.includes('does not exist')) throw new Error('TABLE_MISSING');
  if (error.code === '42501' || error.message?.includes('permission denied')) throw new Error('PERMISSION_DENIED');
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
        try {
          handleDbError(error);
        } catch (e) {
          console.error(e);
        }
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
    subscribe(tenantId: string, onEvent: (payload: any) => void): RealtimeChannel {
      return supabase
        .channel(`realtime:amendments:${tenantId}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'amendments',
          filter: `tenantId=eq.${tenantId}` 
        }, onEvent)
        .subscribe();
    }
  },
  presence: {
    subscribe(tenantId: string, user: User, onSync: (users: any[]) => void): RealtimeChannel {
      const channel = supabase.channel(`presence:${tenantId}`, {
        config: { presence: { key: user.id } }
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const onlineUsers = Object.values(state).flat();
          onSync(onlineUsers);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              id: user.id,
              name: user.name,
              avatar: user.avatarUrl,
              online_at: new Date().toISOString()
            });
          }
        });

      return channel;
    }
  },
  users: {
    async getAll(tenantId: string): Promise<User[]> {
      const { data, error } = await supabase.from('users').select('*').eq('tenantId', tenantId);
      if (error) {
        try { handleDbError(error); } catch(e) {}
        return [];
      }
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
      if (error) return handleDbError(error);
    }
  },
  sectors: {
    async getAll(tenantId: string): Promise<SectorConfig[]> {
      const { data, error } = await supabase.from('sectors').select('*').eq('tenantId', tenantId);
      if (error) {
        try { handleDbError(error); } catch(e) {}
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
        try { handleDbError(error); } catch(e) {}
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
      const { error } = await supabase.from('audit_logs').insert({ ...log, id: generateUUID(), timestamp: new Date().toISOString() });
      if (error) console.warn("Audit Log sync skipped:", error.message);
    },
    async getAll(tenantId: string): Promise<AuditLog[]> {
      const { data, error } = await supabase.from('audit_logs').select('*').eq('tenantId', tenantId).order('timestamp', { ascending: false });
      if (error) {
        try { handleDbError(error); } catch(e) {}
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
    },
    async signOut() {
      await supabase.auth.signOut();
    }
  }
};
