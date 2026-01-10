# Vercel Deployment Guide

## Opcija 1: Deployment preko Vercel Dashboard (PREPORUČENO)

### Koraci:

1. **Idi na Vercel Dashboard:**
   - Otvori https://vercel.com
   - Prijavi se sa GitHub account-om
   - Klikni "Add New..." → "Project"

2. **Import GitHub Repository:**
   - Odaberi `J0BSdev/mint-dApp` repository
   - Klikni "Import"

3. **Configure Project:**
   - **Framework Preset:** Next.js (automatski detektiran)
   - **Root Directory:** `/mint-dapp-frontend` (ako je u subfolderu) ili `/` (ako je u root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next` (automatski)
   - **Install Command:** `npm install`

4. **Environment Variables:**
   Dodaj sljedeće environment varijable u Vercel dashboard:
   
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=12bc234e3c11db5955da7361c9ba34dc
   NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
   NEXT_PUBLIC_MAINNET_RPC_URL=https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
   ```
   
   **Kako dodati:**
   - U project settings, klikni "Environment Variables"
   - Dodaj svaku varijablu zasebno
   - Odaberi "Production", "Preview", i "Development" environments
   - Klikni "Save"

5. **Deploy:**
   - Klikni "Deploy"
   - Čekaj build i deployment
   - Tvoj frontend će biti dostupan na `https://mint-dapp-frontend.vercel.app` (ili custom domain)

---

## Opcija 2: Deployment preko Vercel CLI

### 1. Instalacija i Login:

```bash
cd /home/lovro/dev/mint-dapp-frontend
npx vercel login
```

### 2. Deploy na Preview:

```bash
npx vercel
```

### 3. Deploy na Production:

```bash
npx vercel --prod
```

### 4. Dodavanje Environment Variables preko CLI:

```bash
npx vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
npx vercel env add NEXT_PUBLIC_SEPOLIA_RPC_URL
npx vercel env add NEXT_PUBLIC_MAINNET_RPC_URL
```

Za svaku varijablu ćeš unijeti vrijednost i odabrati environments (Production, Preview, Development).

---

## Opcija 3: Deployment preko npm script

```bash
cd /home/lovro/dev/mint-dapp-frontend
npm run deploy
```

---

## Provjera nakon deploymenta:

1. **Provjeri build logove** - trebaju biti uspješni
2. **Provjeri environment varijable** - trebaju biti postavljene
3. **Testiraj aplikaciju** - otvori URL i provjeri:
   - Wallet connection radi
   - NFT mint funkcionalnost radi
   - Token, Staking, Vesting komponente rade

---

## Troubleshooting:

### Problem: Build fails
**Rješenje:** Provjeri da li sve dependency-ji su instalirani (`npm install`)

### Problem: Environment variables nisu dostupne
**Rješenje:** Provjeri da su sve environment varijable dodane u Vercel dashboard sa `NEXT_PUBLIC_` prefixom

### Problem: Wallet connection ne radi
**Rješenje:** Provjeri da je `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` postavljen ispravno

### Problem: RPC calls fail
**Rješenje:** Provjeri da su `NEXT_PUBLIC_SEPOLIA_RPC_URL` i `NEXT_PUBLIC_MAINNET_RPC_URL` postavljeni i dostupni

---

## Custom Domain (Opciono):

1. U Vercel dashboard, otvori project settings
2. Klikni "Domains"
3. Dodaj svoj custom domain
4. Slijedi upute za DNS konfiguraciju

---

## Automatski Deployment:

Vercel automatski deploya svaki put kada push-uješ na `main` branch:
- Push na `main` → Production deployment
- Push na drugi branch → Preview deployment

