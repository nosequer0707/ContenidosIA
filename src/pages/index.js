import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Login from '../components/Login';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Contenidos IA - Plataforma de Generación de Contenidos</title>
        <meta name="description" content="Sistema de gestión y generación de contenidos asistido por IA para diseñadores" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl font-bold text-blue-800 mb-4">
              Generación de contenidos inteligente para diseñadores
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Optimiza tu flujo de trabajo con nuestra plataforma de generación de contenidos
              asistida por inteligencia artificial. Crea proyectos, busca información relevante
              y genera contenido de alta calidad en minutos.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                Conocer más
              </button>
              <button className="bg-white border-2 border-blue-600 hover:bg-blue-50 text-blue-600 font-bold py-2 px-6 rounded-lg transition duration-300">
                Ver demo
              </button>
            </div>
          </div>
          
          <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-lg">
            <Login />
          </div>
        </div>
      </main>
    </div>
  );
}
