const fs = require('fs');

console.log("Adding utility classes to index.css if not exists...");
let css = fs.readFileSync('src/index.css', 'utf8');
const utilities = `
/* Global Utility Classes */
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-orange { color: var(--orange); }
.text-muted { color: var(--text3); }
.text-sub { color: var(--text2); }
.text-white { color: #fff; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.font-black { font-weight: 800; }
.text-11 { font-size: 11px; }
.text-12 { font-size: 12px; }
.text-13 { font-size: 13px; }
.text-18 { font-size: 18px; }
.text-24 { font-size: 24px; }
.mb-4 { margin-bottom: 4px; }
.mb-8 { margin-bottom: 8px; }
.mb-12 { margin-bottom: 12px; }
.mb-16 { margin-bottom: 16px; }
.mb-20 { margin-bottom: 20px; }
.mb-28 { margin-bottom: 28px; }
.mt-8 { margin-top: 8px; }
.mt-12 { margin-top: 12px; }
.mt-16 { margin-top: 16px; }
.p-20 { padding: 20px; }
.p-24 { padding: 24px; }
.p-40 { padding: 40px; }
.flex { display: flex; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.flex-1 { flex: 1; }
.gap-4 { gap: 4px; }
.gap-6 { gap: 6px; }
.gap-8 { gap: 8px; }
.gap-12 { gap: 12px; }
.gap-14 { gap: 14px; }
.gap-16 { gap: 16px; }
.w-full { width: 100%; }
.uppercase { text-transform: uppercase; }
.capitalize { text-transform: capitalize; }
.d-block { display: block; }
.d-inline-flex { display: inline-flex; }
.d-grid { display: grid; }

/* Login Page specific */
.login-bg { min-height: 100vh; background: linear-gradient(135deg, #16213e, #0f3460); display: flex; align-items: center; justify-content: center; padding: 20px; }
.login-card { background: #fff; border-radius: 16px; padding: 36px; width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,.3); }
.login-logo { width: 56px; height: 56px; background: var(--orange); border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 22px; color: #fff; margin-bottom: 12px; }
.login-input { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: var(--r2); font-size: 14px; outline: none; font-family: inherit; }
.login-input:focus { border-color: var(--orange); }

`;

if (!css.includes('.login-bg')) {
  fs.writeFileSync('src/index.css', css + utilities);
  console.log('Added utilities to index.css');
}

// Update Login.jsx
let loginJSX = fs.readFileSync('src/pages/Login.jsx', 'utf8');
loginJSX = loginJSX.replace(`style={{ minHeight:'100vh', background:'linear-gradient(135deg,#16213e,#0f3460)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}`, 'className="login-bg"');
loginJSX = loginJSX.replace(`style={{ background:'#fff', borderRadius:16, padding:36, width:'100%', maxWidth:400, boxShadow:'0 20px 60px rgba(0,0,0,.3)' }}`, 'className="login-card"');
loginJSX = loginJSX.replace(`style={{ textAlign:'center', marginBottom:28 }}`, 'className="text-center mb-28"');
loginJSX = loginJSX.replace(`style={{ width:56, height:56, background:'var(--orange)', borderRadius:14, display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:22, color:'#fff', margin-bottom:12 }}`, 'className="login-logo"');
loginJSX = loginJSX.replace(`style={{ width:56, height:56, background:'var(--orange)', borderRadius:14, display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:22, color:'#fff', marginBottom:12 }}`, 'className="login-logo"');
loginJSX = loginJSX.replace(`style={{ fontSize:24, fontWeight:700, marginBottom:4 }}`, 'className="text-24 font-bold mb-4"');
loginJSX = loginJSX.replace(`style={{ color:'var(--text2)', fontSize:13 }}`, 'className="text-sub text-13"');

loginJSX = loginJSX.replace(/style=\{\{ marginBottom:16 \}\}/g, 'className="mb-16"');
loginJSX = loginJSX.replace(/style=\{\{ display:'block', fontSize:13, fontWeight:500, marginBottom:6 \}\}/g, 'className="d-block text-13 font-semibold mb-6"');
loginJSX = loginJSX.replace(/style=\{\{ width:'100%', padding:'10px 14px', border:'1\.5px solid var\(--border\)', borderRadius:'var\(--r2\)', fontSize:14, outline:'none', fontFamily:'inherit' \}\}/g, 'className="login-input"');

loginJSX = loginJSX.replace(`style={{ background:'#fee2e2', color:'#dc2626', padding:'8px 12px', borderRadius:'var(--r2)', fontSize:13, marginBottom:12 }}`, 'className="bg-red-100 text-red-600 p-3 rounded-lg text-13 mb-12"');
loginJSX = loginJSX.replace(`style={{ width:'100%', justifyContent:'center', padding:12, fontSize:15, marginTop:8 }}`, 'className="w-full justify-center p-3 text-15 mt-8"');
loginJSX = loginJSX.replace(`style={{ textAlign:'center', fontSize:12, color:'var(--text3)', marginTop:16 }}`, 'className="text-center text-12 text-muted mt-16"');

fs.writeFileSync('src/pages/Login.jsx', loginJSX);
console.log('Updated Login.jsx');
