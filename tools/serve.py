# Dev server: static files with caching disabled, so edits show up on a normal reload.
import http.server, socketserver, sys, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def log_message(self, *a): pass
port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
socketserver.ThreadingTCPServer.allow_reuse_address = True
socketserver.ThreadingTCPServer.daemon_threads = True
with socketserver.ThreadingTCPServer(('', port), H) as s:
    s.serve_forever()
