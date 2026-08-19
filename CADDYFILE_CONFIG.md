# 🌐 HTTPS Caddyfile Configuration for QQBikes (`https://qqbikes.orivex.eu/`)

For automatic **HTTPS SSL** certificate generation and HTTP-to-HTTPS redirect, use this block in your Caddyfile:

```caddy
qqbikes.orivex.eu {
    encode gzip
    reverse_proxy qqbikes_app:5000
}
```

---

## 📜 Full Production HTTPS Caddyfile

Here is your complete updated production Caddyfile supporting **HTTPS** for all domains including **`https://qqbikes.orivex.eu/`**:

```caddy
# --- MOODIF DOMAINS ---
http://moodif.es, http://www.moodif.es {
    encode gzip

    handle /api/* {
        reverse_proxy moodif-back-end-node-app-1:3000
    }

    handle {
        reverse_proxy moodif-front-end:4000
    }
}

http://db.moodif.es {
    reverse_proxy moodif-back-end-node-prisma-studio-1:51212
}

# --- ORIVEX DOMAINS ---
http://orivex.eu {
    encode gzip

    handle /api/* {
        reverse_proxy moodif-backend:5000
    }

    handle {
        reverse_proxy moodif-front-end:4000
    }
}

http://portainer.orivex.eu {
    reverse_proxy portainer:9000
}

# --- QQBIKES MANAGEMENT SYSTEM (HTTPS SSL) ---
qqbikes.orivex.eu {
    encode gzip
    reverse_proxy qqbikes_app:5000
}
```

---

## 🚀 How to Apply and Reload Caddy

1. Paste the block above into your server's `Caddyfile`.
2. Reload Caddy to instantly issue the Let's Encrypt / ZeroSSL HTTPS certificate:

```bash
docker exec -it caddy caddy reload
```

Your app will be live securely at: **`https://qqbikes.orivex.eu/`** 🔐
