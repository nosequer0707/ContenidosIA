import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Crear el contexto de autenticación
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar la sesión actual
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (userData) {
          setUser({
            ...session.user,
            role: userData.role,
            allowed_hours: userData.allowed_hours
          });
        } else {
          setUser(session.user);
        }
      }
      
      setLoading(false);
    };

    checkSession();

    // Configurar listener para cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (userData) {
            setUser({
              ...session.user,
              role: userData.role,
              allowed_hours: userData.allowed_hours
            });
          } else {
            setUser(session.user);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Función para registrarse
  const register = async (email, password, invitationToken) => {
    try {
      // Verificar el token de invitación
      const { data: invitationData, error: invitationError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', invitationToken)
        .eq('email', email)
        .eq('status', 'pending')
        .single();

      if (invitationError || !invitationData) {
        return { data: null, error: { message: 'Invitación inválida o expirada' } };
      }

      // Registrar al usuario
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Actualizar el estado de la invitación
      await supabase
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationData.id);

      // Crear registro de usuario con rol
      await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: email,
            role: 'designer',
            allowed_hours: '9-18',
            created_at: new Date()
          }
        ]);

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Verificar si el usuario puede acceder según horario permitido
  const checkTimeAccess = () => {
    if (!user || user.role === 'admin') return true;
    
    const now = new Date();
    const currentHour = now.getHours();
    
    if (!user.allowed_hours) return true;
    
    const [start, end] = user.allowed_hours.split('-').map(Number);
    return currentHour >= start && currentHour < end;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkTimeAccess,
    supabase
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
