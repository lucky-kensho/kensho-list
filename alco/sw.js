/* 飲酒記録アプリ用のサービスワーカー
   ・ちゃんとした「アプリ」としてインストールさせるために必要
   ・電波が無いところでも開けるようにする
   ・ネットがある時は必ず最新を取りに行くので、更新が古いまま残ることはない
   （キャッシュするのはこのアプリ自身のファイルだけ。外部への通信は一切しない） */

var CACHE = "alco-v5";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// ネット優先。つながらない時だけ手元の控えを使う
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      return res;
    }).catch(function(){
      return caches.match(e.request).then(function(hit){
        return hit || caches.match("./index.html");
      });
    })
  );
});
