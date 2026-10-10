import http.server
import socket

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

class DualStackServer(http.server.ThreadingHTTPServer):
    address_family = socket.AF_INET6

    def server_bind(self):
        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        return super().server_bind()

PORT = 5500

if __name__ == '__main__':
    DualStackServer.allow_reuse_address = True
    with DualStackServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
        print(f"Serving EcoSustain at http://localhost:{PORT} and http://127.0.0.1:{PORT}")
        httpd.serve_forever()
