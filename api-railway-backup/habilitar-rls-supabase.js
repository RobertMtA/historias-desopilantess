/**
 * Script para habilitar Row Level Security (RLS) en tablas de Supabase
 * Este script conecta con Supabase mediante su API REST y habilita RLS
 * en las tablas stories, subscribers, likes y comments
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Validación de credenciales
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Se requieren las variables de entorno SUPABASE_URL y SUPABASE_KEY');
  console.log('Por favor, crea un archivo .env con las siguientes variables:');
  console.log('SUPABASE_URL=tu-url-de-supabase');
  console.log('SUPABASE_KEY=tu-clave-de-servicio-supabase');
  process.exit(1);
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Habilita RLS y configura políticas para una tabla específica
 * @param {string} tableName - Nombre de la tabla 
 */
async function habilitarRLSParaTabla(tableName) {
  console.log(`\n--- Configurando RLS para la tabla ${tableName} ---`);
  
  try {
    // 1. Habilitar RLS en la tabla
    const { data: enableRlsResult, error: enableRlsError } = await supabase.rpc(
      'enable_rls_for_table',
      { table_name: tableName }
    );
    
    if (enableRlsError) {
      console.error(`Error al habilitar RLS en ${tableName}:`, enableRlsError);
      
      // Intentar método alternativo con SQL directo
      console.log(`Intentando método alternativo para habilitar RLS en ${tableName}...`);
      const { error: sqlError } = await supabase.rpc(
        'execute_sql', 
        { sql_query: `ALTER TABLE "${tableName}" ENABLE ROW LEVEL SECURITY;` }
      );
      
      if (sqlError) {
        console.error(`Error con método alternativo:`, sqlError);
        return false;
      } else {
        console.log(`RLS habilitado con éxito para ${tableName} mediante SQL directo`);
      }
    } else {
      console.log(`RLS habilitado con éxito para ${tableName}`);
    }

    // 2. Crear políticas según el tipo de tabla
    const políticas = generarPolíticasParaTabla(tableName);
    
    // 3. Aplicar políticas
    for (const política of políticas) {
      console.log(`Creando política: ${política.nombre}`);
      
      const { error: policyError } = await supabase.rpc(
        'create_policy',
        {
          table_name: tableName,
          policy_name: política.nombre,
          policy_definition: política.definición,
          policy_action: política.acción,
          policy_role: política.rol
        }
      );
      
      if (policyError) {
        console.error(`Error al crear política ${política.nombre}:`, policyError);
        
        // Intentar método alternativo con SQL directo
        console.log(`Intentando método alternativo para la política ${política.nombre}...`);
        const sqlPolitica = `
          CREATE POLICY "${política.nombre}" 
          ON "${tableName}" 
          FOR ${política.acción} 
          TO ${política.rol} 
          USING (${política.definición});
        `;
        
        const { error: sqlPolicyError } = await supabase.rpc(
          'execute_sql',
          { sql_query: sqlPolitica }
        );
        
        if (sqlPolicyError) {
          console.error(`Error con método alternativo para política:`, sqlPolicyError);
        } else {
          console.log(`Política ${política.nombre} creada con éxito mediante SQL directo`);
        }
      } else {
        console.log(`Política ${política.nombre} creada con éxito`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error inesperado para tabla ${tableName}:`, error);
    return false;
  }
}

/**
 * Genera políticas específicas según el tipo de tabla
 * @param {string} tableName - Nombre de la tabla 
 * @returns {Array} - Lista de políticas a aplicar
 */
function generarPolíticasParaTabla(tableName) {
  switch (tableName) {
    case 'stories':
      return [
        {
          nombre: 'stories_select_policy',
          acción: 'SELECT',
          rol: 'authenticated',
          definición: 'true'
        },
        {
          nombre: 'stories_select_anon',
          acción: 'SELECT',
          rol: 'anon',
          definición: 'true'
        },
        {
          nombre: 'stories_insert_authenticated',
          acción: 'INSERT',
          rol: 'authenticated',
          definición: 'auth.uid() IS NOT NULL'
        },
        {
          nombre: 'stories_update_authenticated',
          acción: 'UPDATE',
          rol: 'authenticated',
          definición: 'auth.uid() = autor_id'
        },
        {
          nombre: 'stories_delete_authenticated',
          acción: 'DELETE',
          rol: 'authenticated',
          definición: 'auth.uid() = autor_id'
        }
      ];
    
    case 'comments':
      return [
        {
          nombre: 'comments_select_policy',
          acción: 'SELECT',
          rol: 'authenticated',
          definición: 'true'
        },
        {
          nombre: 'comments_select_anon',
          acción: 'SELECT',
          rol: 'anon',
          definición: 'true'
        },
        {
          nombre: 'comments_insert_authenticated',
          acción: 'INSERT',
          rol: 'authenticated',
          definición: 'auth.uid() IS NOT NULL'
        },
        {
          nombre: 'comments_update_authenticated',
          acción: 'UPDATE',
          rol: 'authenticated',
          definición: 'auth.uid() = user_id'
        },
        {
          nombre: 'comments_delete_authenticated',
          acción: 'DELETE',
          rol: 'authenticated',
          definición: 'auth.uid() = user_id'
        }
      ];
    
    case 'likes':
      return [
        {
          nombre: 'likes_select_policy',
          acción: 'SELECT',
          rol: 'authenticated',
          definición: 'true'
        },
        {
          nombre: 'likes_select_anon',
          acción: 'SELECT',
          rol: 'anon',
          definición: 'true'
        },
        {
          nombre: 'likes_insert_authenticated',
          acción: 'INSERT',
          rol: 'authenticated',
          definición: 'auth.uid() IS NOT NULL'
        },
        {
          nombre: 'likes_update_authenticated',
          acción: 'UPDATE',
          rol: 'authenticated',
          definición: 'auth.uid() = user_id'
        },
        {
          nombre: 'likes_delete_authenticated',
          acción: 'DELETE',
          rol: 'authenticated',
          definición: 'auth.uid() = user_id'
        }
      ];
    
    case 'subscribers':
      return [
        {
          nombre: 'subscribers_select_policy',
          acción: 'SELECT',
          rol: 'authenticated',
          definición: 'auth.uid() = user_id OR auth.uid() IN (SELECT id FROM admins)'
        },
        {
          nombre: 'subscribers_insert_policy',
          acción: 'INSERT',
          rol: 'authenticated',
          definición: 'auth.uid() IS NOT NULL'
        },
        {
          nombre: 'subscribers_insert_anon',
          acción: 'INSERT',
          rol: 'anon',
          definición: 'true'
        },
        {
          nombre: 'subscribers_update_policy',
          acción: 'UPDATE',
          rol: 'authenticated',
          definición: 'auth.uid() = user_id OR auth.uid() IN (SELECT id FROM admins)'
        },
        {
          nombre: 'subscribers_delete_policy',
          acción: 'DELETE',
          rol: 'authenticated',
          definición: 'auth.uid() = user_id OR auth.uid() IN (SELECT id FROM admins)'
        }
      ];
    
    default:
      return [
        {
          nombre: `${tableName}_select_authenticated`,
          acción: 'SELECT',
          rol: 'authenticated',
          definición: 'true'
        },
        {
          nombre: `${tableName}_insert_authenticated`,
          acción: 'INSERT',
          rol: 'authenticated',
          definición: 'auth.uid() IS NOT NULL'
        }
      ];
  }
}

/**
 * Verifica el estado actual de RLS para una tabla
 * @param {string} tableName - Nombre de la tabla
 */
async function verificarRLSEstado(tableName) {
  try {
    console.log(`\nVerificando estado actual de RLS para ${tableName}...`);
    
    const { data, error } = await supabase.rpc(
      'execute_sql',
      { sql_query: `SELECT relrowsecurity FROM pg_class WHERE relname = '${tableName}';` }
    );
    
    if (error) {
      console.error(`Error al verificar estado RLS para ${tableName}:`, error);
      return null;
    }
    
    if (data && data.length > 0) {
      const habilitado = data[0].relrowsecurity;
      console.log(`RLS para ${tableName}: ${habilitado ? 'HABILITADO' : 'DESHABILITADO'}`);
      return habilitado;
    } else {
      console.log(`No se pudo determinar el estado de RLS para ${tableName}`);
      return null;
    }
  } catch (error) {
    console.error(`Error inesperado al verificar RLS para ${tableName}:`, error);
    return null;
  }
}

/**
 * Verifica las políticas existentes para una tabla
 * @param {string} tableName - Nombre de la tabla
 */
async function verificarPoliticas(tableName) {
  try {
    console.log(`\nVerificando políticas existentes para ${tableName}...`);
    
    const { data, error } = await supabase.rpc(
      'execute_sql',
      { sql_query: `
        SELECT 
          pol.polname AS policy_name, 
          CASE
            WHEN pol.polcmd = 'r' THEN 'SELECT'
            WHEN pol.polcmd = 'a' THEN 'INSERT'
            WHEN pol.polcmd = 'w' THEN 'UPDATE'
            WHEN pol.polcmd = 'd' THEN 'DELETE'
            ELSE pol.polcmd::text
          END AS command,
          pg_get_expr(pol.polqual, pol.polrelid) AS using_expr
        FROM pg_policy pol
        JOIN pg_class c ON pol.polrelid = c.oid
        WHERE c.relname = '${tableName}';
      ` }
    );
    
    if (error) {
      console.error(`Error al verificar políticas para ${tableName}:`, error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log(`Políticas encontradas para ${tableName}:`);
      data.forEach((política, i) => {
        console.log(`${i+1}. ${política.policy_name} (${política.command}): ${política.using_expr}`);
      });
    } else {
      console.log(`No se encontraron políticas para ${tableName}`);
    }
  } catch (error) {
    console.error(`Error inesperado al verificar políticas para ${tableName}:`, error);
  }
}

/**
 * Función principal para habilitar RLS en todas las tablas
 */
async function main() {
  console.log('=== Iniciando configuración de Row Level Security en Supabase ===');
  console.log(`Fecha: ${new Date().toLocaleString()}`);
  
  // Tablas que necesitan RLS habilitado
  const tablas = ['stories', 'comments', 'likes', 'subscribers'];
  
  // Verificar estado actual de RLS en todas las tablas
  console.log('\n--- VERIFICANDO ESTADO ACTUAL DE RLS ---');
  for (const tabla of tablas) {
    await verificarRLSEstado(tabla);
  }
  
  // Habilitar RLS y configurar políticas para cada tabla
  console.log('\n--- HABILITANDO RLS Y CONFIGURANDO POLÍTICAS ---');
  for (const tabla of tablas) {
    await habilitarRLSParaTabla(tabla);
  }
  
  // Verificar que RLS esté habilitado y las políticas estén configuradas
  console.log('\n--- VERIFICACIÓN FINAL ---');
  for (const tabla of tablas) {
    await verificarRLSEstado(tabla);
    await verificarPoliticas(tabla);
  }
  
  console.log('\n=== Configuración de Row Level Security completada ===');
}

// Ejecutar la función principal
main()
  .catch(error => {
    console.error('Error durante la ejecución:', error);
    process.exit(1);
  });
