import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="bg-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Contenidos IA
            </Link>
            
            {user && (
              <div className="ml-10 hidden md:flex space-x-6">
                <Link href="/dashboard" className={`hover:text-blue-200 ${router.pathname === '/dashboard' ? 'text-blue-200 font-semibold' : ''}`}>
                  Dashboard
                </Link>
                <Link href="/projects" className={`hover:text-blue-200 ${router.pathname.startsWith('/projects') ? 'text-blue-200 font-semibold' : ''}`}>
                  Proyectos
                </Link>
                {user.role === 'admin' && (
                  <>
                    <Link href="/admin" className={`hover:text-blue-200 ${router.pathname.startsWith('/admin') ? 'text-blue-200 font-semibold' : ''}`}>
                      Administración
                    </Link>
                    <Link href="/admin/invitations" className={`hover:text-blue-200 ${router.pathname === '/admin/invitations' ? 'text-blue-200 font-semibold' : ''}`}>
                      Invitaciones
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="hidden md:inline">{user.email}</span>
                <button 
                  onClick={handleLogout}
                  className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg transition duration-300"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg transition duration-300">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
