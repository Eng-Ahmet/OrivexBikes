# QQBikes Project Rules & Build Guidelines

## 1. Architectural Guidelines
- **Unified Single Project**: Managed via root `package.json` with Node.js Express backend and static frontend.
- **2-Role Permission Model**: Simplified authorization with `ADMIN` and `EMPLOYEE` linked directly to `store_id` / `campsite_id`.
- **Environment Variable Binding**: All configuration parameters (`PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`) must be bound to `.env`.

## 2. Docker & Container Security
- **No External MySQL Host Ports**: MySQL container `db` must use `expose: ["3306"]` inside `qqbikes_network` without exposing port 3306 to host machines.
- **Dedicated Volume**: Always use project-scoped volume `qqbikes_mysql_data`.

## 3. PWA & TWA Store Deployment
- PWA manifest stored in `frontend/public/manifest.json`.
- Digital Asset Links stored in `frontend/public/.well-known/assetlinks.json`.
- Application package ID: `com.qqbikes.app.twa`.
- Signed APK builds require RSA-2048 key alignment via `uber-apk-signer`.
