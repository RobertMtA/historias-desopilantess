import http.server
import socketserver
import json
import urllib.parse
from datetime import datetime

class LoginHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Manejo de preflight CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()
    
    def do_GET(self):
        """Manejo de peticiones GET"""
        timestamp = datetime.now().isoformat()
        print(f"{timestamp} - GET {self.path}")
        
        # Headers CORS
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        
        if self.path.startswith('/api/test'):
            print("✅ Ruta /api/test accedida")
            response = {
                "message": "✅ Servidor Python funcionando correctamente",
                "timestamp": timestamp,
                "method": "GET",
                "url": self.path,
                "port": 3007
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            print(f"❓ Ruta no encontrada: {self.path}")
            response = {
                "error": "Ruta no encontrada",
                "method": "GET",
                "url": self.path,
                "availableRoutes": [
                    "GET /api/test",
                    "POST /api/admin/auth/login"
                ]
            }
            self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        """Manejo de peticiones POST"""
        timestamp = datetime.now().isoformat()
        print(f"{timestamp} - POST {self.path}")
        
        # Headers CORS
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        
        if self.path == '/api/admin/auth/login':
            try:
                print("🔐 POST /api/admin/auth/login - Iniciando proceso")
                
                # Leer el body
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length).decode()
                
                print(f"📧 Body recibido (raw): {body}")
                
                if body:
                    data = json.loads(body)
                    email = data.get('email', '')
                    password = data.get('password', '')
                    
                    print(f"📧 Email: {email}")
                    print(f"🔑 Password: {'***presente***' if password else '***ausente***'}")
                    
                    # Validar credenciales
                    if email == 'robertogaona1985@gmail.com' and password == 'admin123':
                        print("✅ Credenciales correctas - Login exitoso")
                        response = {
                            "message": "Login exitoso",
                            "token": f"fake-jwt-token-for-testing-{int(datetime.now().timestamp())}",
                            "admin": {
                                "id": "1",
                                "email": "robertogaona1985@gmail.com",
                                "nombre": "Roberto Gaona",
                                "rol": "superadmin"
                            }
                        }
                        print("📤 Enviando respuesta exitosa")
                        self.wfile.write(json.dumps(response).encode())
                    else:
                        print("❌ Credenciales incorrectas")
                        print(f"❌ Email esperado: robertogaona1985@gmail.com, recibido: {email}")
                        print(f"❌ Password esperado: admin123, recibido: {password}")
                        response = {"error": "Credenciales inválidas"}
                        self.wfile.write(json.dumps(response).encode())
                else:
                    print("❌ Body vacío")
                    response = {"error": "Body vacío"}
                    self.wfile.write(json.dumps(response).encode())
                    
            except Exception as e:
                print(f"💥 Error en login: {e}")
                response = {"error": f"Error interno: {str(e)}"}
                self.wfile.write(json.dumps(response).encode())
        else:
            print(f"❓ Ruta POST no encontrada: {self.path}")
            response = {
                "error": "Ruta no encontrada",
                "method": "POST",
                "url": self.path
            }
            self.wfile.write(json.dumps(response).encode())

if __name__ == "__main__":
    PORT = 3007
    
    try:
        with socketserver.TCPServer(("127.0.0.1", PORT), LoginHandler) as httpd:
            print(f"🚀 Servidor Python ejecutándose en puerto {PORT}")
            print(f"🔗 API Test: http://localhost:{PORT}/api/test")
            print(f"🔐 API Login: http://localhost:{PORT}/api/admin/auth/login")
            print("⚡ Servidor listo para recibir peticiones")
            print("🛑 Presiona Ctrl+C para detener")
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido por el usuario")
    except Exception as e:
        print(f"💥 Error al iniciar servidor: {e}")
