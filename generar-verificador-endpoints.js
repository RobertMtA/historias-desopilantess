/**
 * VERIFICADOR DE ENDPOINTS PARA EL FRONTEND
 * 
 * Este script genera una página HTML sencilla que te permite probar los endpoints
 * de la API desde el navegador y verificar que funcionan correctamente.
 */

const fs = require('fs');
const path = require('path');

// Colores para la consola
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';

console.log(`${CYAN}==================================================${RESET}`);
console.log(`${CYAN}     GENERANDO VERIFICADOR DE ENDPOINTS HTML${RESET}`);
console.log(`${CYAN}==================================================${RESET}\n`);

// URL base de la API en Railway
const RAILWAY_URL = 'https://historias-desopilantes-react-production.up.railway.app';

// Contenido de la página HTML
const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificador de Endpoints - Historias Desopilantes</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .panel {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
            margin-bottom: 30px;
        }
        h2 {
            color: #444;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
            margin-top: 0;
        }
        button {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
            margin-bottom: 10px;
            transition: background-color 0.3s;
        }
        button:hover {
            background-color: #45a049;
        }
        .output {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 15px;
            margin-top: 15px;
            min-height: 100px;
            max-height: 300px;
            overflow-y: auto;
            white-space: pre-wrap;
        }
        .error {
            color: #D32F2F;
            font-weight: bold;
        }
        .success {
            color: #388E3C;
            font-weight: bold;
        }
        .status {
            display: inline-block;
            padding: 3px 6px;
            border-radius: 3px;
            font-size: 12px;
            margin-left: 8px;
        }
        .status.ok {
            background-color: #C8E6C9;
            color: #388E3C;
        }
        .status.error {
            background-color: #FFCDD2;
            color: #D32F2F;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        .timestamp {
            color: #777;
            font-size: 12px;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <h1>Verificador de Endpoints - Historias Desopilantes</h1>
    
    <div class="panel">
        <h2>Configuración</h2>
        <div>
            <label for="apiUrl">URL Base de la API:</label>
            <input type="text" id="apiUrl" value="${RAILWAY_URL}" style="width: 350px; padding: 8px; margin: 10px 0;">
            <button onclick="resetUrl()">Resetear URL</button>
        </div>
    </div>
    
    <div class="panel">
        <h2>Estado General de la API</h2>
        <button onclick="checkAllEndpoints()">Verificar Todos los Endpoints</button>
        <button onclick="clearResults('generalOutput')">Limpiar Resultados</button>
        <div id="generalOutput" class="output">Haz clic en "Verificar Todos los Endpoints" para comenzar...</div>
    </div>
    
    <div class="panel">
        <h2>Verificar Endpoints Individuales</h2>
        
        <table>
            <tr>
                <th>Endpoint</th>
                <th>Acción</th>
                <th>Estado</th>
            </tr>
            <tr>
                <td>/api/health</td>
                <td><button onclick="checkEndpoint('/api/health')">Verificar</button></td>
                <td id="status-health">-</td>
            </tr>
            <tr>
                <td>/api/historias</td>
                <td><button onclick="checkEndpoint('/api/historias')">Verificar</button></td>
                <td id="status-historias">-</td>
            </tr>
            <tr>
                <td>/api/historias/1</td>
                <td><button onclick="checkEndpoint('/api/historias/1')">Verificar</button></td>
                <td id="status-historia">-</td>
            </tr>
            <tr>
                <td>/api/comentarios/1</td>
                <td><button onclick="checkEndpoint('/api/comentarios/1')">Verificar</button></td>
                <td id="status-comentarios">-</td>
            </tr>
            <tr>
                <td>/api/likes/1</td>
                <td><button onclick="checkEndpoint('/api/likes/1')">Verificar</button></td>
                <td id="status-likes">-</td>
            </tr>
        </table>
        
        <h3>Resultado Detallado</h3>
        <button onclick="clearResults('individualOutput')">Limpiar Resultados</button>
        <div id="individualOutput" class="output">Selecciona un endpoint específico para verificar...</div>
    </div>

    <div class="panel">
        <h2>Diagnóstico CORS</h2>
        <p>Esta sección verifica si hay problemas de CORS entre el frontend y el backend.</p>
        <button onclick="checkCORS()">Verificar CORS</button>
        <button onclick="clearResults('corsOutput')">Limpiar Resultados</button>
        <div id="corsOutput" class="output">Haz clic en "Verificar CORS" para comenzar...</div>
    </div>
    
    <script>
        // Función para verificar un endpoint específico
        async function checkEndpoint(endpoint) {
            const outputDiv = document.getElementById('individualOutput');
            const statusId = 'status-' + endpoint.split('/').pop().replace(/\\//g, '-');
            const statusElement = document.getElementById(statusId);
            
            try {
                const baseUrl = document.getElementById('apiUrl').value;
                const url = \`\${baseUrl}\${endpoint}\`;
                
                outputDiv.innerHTML = \`Verificando \${url}...\`;
                
                const startTime = new Date().getTime();
                const response = await fetch(url);
                const endTime = new Date().getTime();
                
                const data = await response.json();
                const status = response.status;
                const time = endTime - startTime;
                
                let statusHtml = '';
                if (response.ok) {
                    statusHtml = \`<span class="status ok">OK (\${status})</span>\`;
                    if (statusElement) statusElement.innerHTML = statusHtml;
                } else {
                    statusHtml = \`<span class="status error">Error (\${status})</span>\`;
                    if (statusElement) statusElement.innerHTML = statusHtml;
                }
                
                outputDiv.innerHTML = \`
                    <div class="success">✓ Endpoint disponible: \${url} \${statusHtml}</div>
                    <div>Tiempo de respuesta: \${time}ms</div>
                    <div>Código de estado: \${status}</div>
                    <h4>Datos recibidos:</h4>
                    <pre>\${JSON.stringify(data, null, 2)}</pre>
                    <div class="timestamp">Verificado: \${new Date().toLocaleString()}</div>
                \`;
            } catch (error) {
                const statusHtml = \`<span class="status error">ERROR</span>\`;
                if (statusElement) statusElement.innerHTML = statusHtml;
                
                outputDiv.innerHTML = \`
                    <div class="error">✗ Error al verificar el endpoint: \${endpoint}</div>
                    <div>\${error.message}</div>
                    <div class="timestamp">Verificado: \${new Date().toLocaleString()}</div>
                \`;
            }
        }
        
        // Función para verificar todos los endpoints
        async function checkAllEndpoints() {
            const outputDiv = document.getElementById('generalOutput');
            const baseUrl = document.getElementById('apiUrl').value;
            
            outputDiv.innerHTML = 'Verificando todos los endpoints...<br>';
            
            const endpoints = [
                '/api/health',
                '/api/historias',
                '/api/historias/1',
                '/api/comentarios/1',
                '/api/likes/1'
            ];
            
            const results = {};
            
            for (const endpoint of endpoints) {
                try {
                    const url = \`\${baseUrl}\${endpoint}\`;
                    const startTime = new Date().getTime();
                    const response = await fetch(url);
                    const endTime = new Date().getTime();
                    const time = endTime - startTime;
                    
                    if (response.ok) {
                        results[endpoint] = {
                            status: response.status,
                            time,
                            ok: true
                        };
                        
                        // Actualizar la tabla de estado
                        const statusId = 'status-' + endpoint.split('/').pop().replace(/\\//g, '-');
                        const statusElement = document.getElementById(statusId);
                        if (statusElement) {
                            statusElement.innerHTML = \`<span class="status ok">OK (\${response.status})</span>\`;
                        }
                    } else {
                        results[endpoint] = {
                            status: response.status,
                            time,
                            ok: false
                        };
                        
                        // Actualizar la tabla de estado
                        const statusId = 'status-' + endpoint.split('/').pop().replace(/\\//g, '-');
                        const statusElement = document.getElementById(statusId);
                        if (statusElement) {
                            statusElement.innerHTML = \`<span class="status error">Error (\${response.status})</span>\`;
                        }
                    }
                } catch (error) {
                    results[endpoint] = {
                        error: error.message,
                        ok: false
                    };
                    
                    // Actualizar la tabla de estado
                    const statusId = 'status-' + endpoint.split('/').pop().replace(/\\//g, '-');
                    const statusElement = document.getElementById(statusId);
                    if (statusElement) {
                        statusElement.innerHTML = \`<span class="status error">ERROR</span>\`;
                    }
                }
            }
            
            // Contar resultados
            const successCount = Object.values(results).filter(r => r.ok).length;
            const failCount = endpoints.length - successCount;
            
            // Generar resumen HTML
            let html = \`
                <h3>Resumen de Verificación</h3>
                <div>\${successCount} endpoints OK, \${failCount} con error</div>
                <table>
                    <tr>
                        <th>Endpoint</th>
                        <th>Estado</th>
                        <th>Tiempo</th>
                    </tr>
            \`;
            
            for (const endpoint of endpoints) {
                const result = results[endpoint];
                if (result.ok) {
                    html += \`
                        <tr>
                            <td>\${endpoint}</td>
                            <td><span class="status ok">OK (\${result.status})</span></td>
                            <td>\${result.time}ms</td>
                        </tr>
                    \`;
                } else {
                    html += \`
                        <tr>
                            <td>\${endpoint}</td>
                            <td><span class="status error">\${result.error ? 'ERROR' : \`Error (\${result.status})\`}</span></td>
                            <td>\${result.time ? result.time + 'ms' : '-'}</td>
                        </tr>
                    \`;
                }
            }
            
            html += \`
                </table>
                <div class="timestamp">Verificación completada: \${new Date().toLocaleString()}</div>
            \`;
            
            outputDiv.innerHTML = html;
        }
        
        // Verificar problemas CORS
        async function checkCORS() {
            const outputDiv = document.getElementById('corsOutput');
            const baseUrl = document.getElementById('apiUrl').value;
            
            outputDiv.innerHTML = 'Verificando configuración CORS...<br>';
            
            try {
                const url = \`\${baseUrl}/api/health\`;
                
                // Primera solicitud: simple GET
                const simpleResponse = await fetch(url);
                
                // Segunda solicitud: con credentials
                const credentialsResponse = await fetch(url, {
                    credentials: 'include'
                });
                
                // Tercera solicitud: con cabeceras personalizadas
                const customHeaderResponse = await fetch(url, {
                    headers: {
                        'X-Test-Header': 'test-value',
                        'Content-Type': 'application/json'
                    }
                });
                
                // Verificar resultados
                const simpleOk = simpleResponse.ok;
                const credentialsOk = credentialsResponse.ok;
                const customHeaderOk = customHeaderResponse.ok;
                
                let corsStatus = 'OK';
                let corsMessage = 'La configuración CORS parece estar funcionando correctamente.';
                
                if (!simpleOk) {
                    corsStatus = 'ERROR';
                    corsMessage = 'Problema con solicitudes simples. Verifica que CORS esté habilitado en el servidor.';
                } else if (!customHeaderOk) {
                    corsStatus = 'ADVERTENCIA';
                    corsMessage = 'Problema con cabeceras personalizadas. Es posible que necesites configurar CORS para aceptar cabeceras adicionales.';
                }
                
                outputDiv.innerHTML = \`
                    <h3>Estado CORS: <span class="\${corsStatus === 'OK' ? 'success' : 'error'}">\${corsStatus}</span></h3>
                    <div>\${corsMessage}</div>
                    <h4>Resultados detallados:</h4>
                    <ul>
                        <li>Solicitud simple: <span class="\${simpleOk ? 'success' : 'error'}">\${simpleOk ? '✓ OK' : '✗ Error'}</span></li>
                        <li>Solicitud con credentials: <span class="\${credentialsOk ? 'success' : 'error'}">\${credentialsOk ? '✓ OK' : '✗ Error'}</span></li>
                        <li>Solicitud con cabeceras personalizadas: <span class="\${customHeaderOk ? 'success' : 'error'}">\${customHeaderOk ? '✓ OK' : '✗ Error'}</span></li>
                    </ul>
                    <div class="timestamp">Verificación completada: \${new Date().toLocaleString()}</div>
                \`;
            } catch (error) {
                outputDiv.innerHTML = \`
                    <div class="error">✗ Error al verificar CORS</div>
                    <div>\${error.message}</div>
                    <p>Es posible que haya un problema de CORS. Verifica que el servidor tenga habilitado CORS 
                    para permitir solicitudes desde este origen.</p>
                    <div class="timestamp">Verificación completada: \${new Date().toLocaleString()}</div>
                \`;
            }
        }
        
        // Función para limpiar resultados
        function clearResults(elementId) {
            const outputDiv = document.getElementById(elementId);
            if (elementId === 'generalOutput') {
                outputDiv.innerHTML = 'Haz clic en "Verificar Todos los Endpoints" para comenzar...';
            } else if (elementId === 'individualOutput') {
                outputDiv.innerHTML = 'Selecciona un endpoint específico para verificar...';
            } else if (elementId === 'corsOutput') {
                outputDiv.innerHTML = 'Haz clic en "Verificar CORS" para comenzar...';
            }
        }
        
        // Función para resetear la URL
        function resetUrl() {
            document.getElementById('apiUrl').value = '${RAILWAY_URL}';
        }
    </script>
</body>
</html>`;

// Guardar el archivo HTML
const htmlFilePath = path.join(__dirname, 'verificador-endpoints.html');
fs.writeFileSync(htmlFilePath, htmlContent);

console.log(`${GREEN}✓ Archivo HTML generado exitosamente en: ${htmlFilePath}${RESET}`);
console.log(`${YELLOW}Para usar el verificador:${RESET}`);
console.log("1. Abre el archivo verificador-endpoints.html en tu navegador");
console.log("2. Usa la herramienta para verificar cada endpoint y detectar problemas");
console.log("3. Si encuentras problemas, ejecuta el script de solución de endpoints");
