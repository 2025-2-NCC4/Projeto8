# 🚀 PicMoney Dashboard - Quick Start Guide

## ⚡ SIMPLE START (2 Steps)

### Step 1: Start Backend
```bash
cd src/Entrega1/Backend
npm run dev
```
**Wait for:** `🚀 Servidor rodando na porta 3002`

### Step 2: Start Frontend
```bash
cd src/Entrega1/Frontend
npm run dev
```

## 🌐 Access Your Dashboard
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3002/api

---

## 🚨 If You Get "Port Already in Use" Error

**Quick Fix:**
```bash
# Kill existing processes
pkill -f "npm run dev"
lsof -ti:3002 | xargs kill -9

# Wait 3 seconds, then restart normally
```

---

## ✅ What You Get

### 📊 Main Dashboard
- Average Ticket: R$ 550.49
- Operating Margin: 87.2%
- Net Revenue: R$ 48M+
- All key performance indicators

### 📈 Analysis Views
- **Financial Analysis** - Operating margins & net revenue
- **Coupon Analysis** - Performance by type & temporal analysis
- **Validation Screen** - Coupon validation & payouts
- **Geographic Analysis** - Customer heatmaps
- **Categories** - Top establishment categories

### 🔧 Technical Features
- ✅ No more infinite loading (fixed!)
- ✅ Request timeouts & error handling
- ✅ Debounced filtering
- ✅ Real-time data from 100k+ transactions
- ✅ Responsive design with dark/light themes

---

## 💡 Pro Tips

1. **Always start Backend first** (wait for success message)
2. **Use Ctrl+C** to stop servers properly
3. **If problems persist**, restart both servers
4. **Check browser console** for any error messages

---

**Need help?** The application loads 100,000 transactions automatically and provides all the required business intelligence views your professor requested!