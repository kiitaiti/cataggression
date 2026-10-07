import json, sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
MODE = sys.argv[1] if len(sys.argv)>1 else 'normal'   # normal | empty | error
img = {"url":"https://images.microcms-assets.io/assets/x/y/sample.png","width":400,"height":400}
members = [
 {"id":"m1","name":"よわい","slug":"yowai","division":["streamer"],"sortOrder":1,"avatar":img,"socialLinks":[{"fieldId":"socialLink","service":["x"],"url":"https://x.com/yowasugi_warot"}],"publishedAt":"2026-09-01T00:00:00.000Z","createdAt":"2026-09-01T00:00:00.000Z","updatedAt":"2026-09-01T00:00:00.000Z"},
 {"id":"m2","name":"N4YUT4","slug":"n4yut4","division":["valorant"],"sortOrder":1,"role":"Duelist","games":"VALORANT","socialLinks":[{"service":["x"],"url":"https://x.com/IAS_nayuta_rrkn"}],"body":"<p>hello <script>alert(1)</script><a href='https://example.com'>ext</a></p>","publishedAt":"2026-09-01T00:00:00.000Z","createdAt":"2026-09-01T00:00:00.000Z","updatedAt":"2026-09-01T00:00:00.000Z"},
]
cats=[{"id":"c1","name":"お知らせ","slug":"info"},{"id":"c2","name":"大会","slug":"tournament"}]
news=[{"id":f"n{i}","title":f"テスト記事 {i}","slug":f"post-{i}","category":cats[i%2],"excerpt":"抜粋です。","body":"<h2>見出し</h2><p>本文<img src='https://images.microcms-assets.io/a.png'></p><iframe src='https://evil'></iframe>","articleDate":f"2026-09-{10+i:02d}T00:00:00.000Z","publishedAt":f"2026-09-{10+i:02d}T00:00:00.000Z","createdAt":"2026-09-01T00:00:00.000Z","updatedAt":"2026-09-01T00:00:00.000Z"} for i in range(1,5)]
partners=[{"id":"p1","name":"Sample Partner","logo":img,"url":"https://example.com","sortOrder":1}]
settings={"id":"s","teamName":"CAT AGGRESSION","heroCatchcopy":"CMSからのコピー。","heroDescription":"CMS説明文","aboutText":"CMSのabout\n\n2段落目","officialXUrl":"https://x.com/cataggression01","contactEmail":"contact@example.com","createdAt":"","updatedAt":""}
def listres(items, q):
    limit=int(q.get('limit',['10'])[0]); offset=int(q.get('offset',['0'])[0])
    f=q.get('filters',[None])[0]
    if f:
        field,_,val=f.partition('[equals]')
        def get(it,field):
            cur=it
            for part in field.split('.'):
                cur=cur.get(part) if isinstance(cur,dict) else None
            return cur
        items=[it for it in items if get(it,field)==val]
    return {"contents":items[offset:offset+limit],"totalCount":len(items),"offset":offset,"limit":limit}
class H(BaseHTTPRequestHandler):
    def log_message(self,*a): pass
    def do_GET(self):
        if MODE=='error': self.send_response(500); self.end_headers(); return
        if self.headers.get('X-MICROCMS-API-KEY')!='testkey': self.send_response(401); self.end_headers(); return
        u=urlparse(self.path); q=parse_qs(u.query); ep=u.path.split('/api/v1/')[1]
        data={'members':members,'news':news,'categories':cats,'partners':partners}
        if MODE=='empty': data={k:[] for k in data}
        if ep=='site-settings': body=settings
        elif ep in data: body=listres(data[ep],q)
        else: self.send_response(404); self.end_headers(); return
        b=json.dumps(body).encode(); self.send_response(200); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(b))); self.end_headers(); self.wfile.write(b)
HTTPServer(('127.0.0.1',4000),H).serve_forever()
