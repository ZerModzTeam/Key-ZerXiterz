const firebaseConfig = {
  apiKey: "AIzaSyAjDUzQMk7Vs23aXk3swyQaTD1ygx6b0dY",
  databaseURL: "https://zerx-17d95-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zerx-17d95",
  appId: "1:374648942327:web:d62d5c58b95ca5e29a6df2"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
let session = null;
let countdownInterval;

window.onload = () => {
    const saved = localStorage.getItem('zerx_session');
    if(saved) { session = JSON.parse(saved); monitorAccount(); }
    drawStars();
};

function monitorAccount() {
    if(session.user === "acumalaka") {
        startPanel();
        document.getElementById('disp-countdown').innerText = "WAKTU : PERMANENT";
        document.getElementById('disp-statis').innerText = "SAMPAI : UNLIMITED";
        return;
    }
    db.ref('users/' + session.user).on('value', s => {
        if(!s.exists()) { doLogout(); return; }
        const data = s.val();
        session = data;
        startPanel();
        runCountdown(data.expiry);
        document.getElementById('disp-statis').innerText = "SAMPAI : " + new Date(data.expiry).toLocaleString('id-ID');
    });
}

function runCountdown(expiry) {
    if(countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        const diff = new Date(expiry).getTime() - new Date().getTime();
        if(diff <= 0) { doLogout(); }
        else {
            const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
            document.getElementById('disp-countdown').innerText = `WAKTU : ${d}d ${h}h ${m}s`;
        }
    }, 1000);
}

function startPanel() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('disp-usn').innerText = `USN : ${session.user.toUpperCase()}`;
    if(session.role === "OWNER" || session.role === "ADMIN") document.getElementById('admin-tools').classList.remove('hidden');
}

function show(id) {
    document.querySelectorAll('.box').forEach(b => { b.classList.add('hidden'); b.classList.remove('animate-in'); });
    const target = document.getElementById(id);
    if(target) {
        target.classList.remove('hidden');
        void target.offsetWidth; target.classList.add('animate-in');
        if(id === 'list-scr') loadKeys();
        if(id === 'manage-user-scr') loadUsers();
    }
}

async function authLogin() {
    const u = document.getElementById('u_log').value, p = document.getElementById('p_log').value;
    if(u === "acumalaka" && p === "gblk8989") { session = {user:u, role:"OWNER"}; loginOk(); return; }
    db.ref('users/'+u).once('value', s => {
        if(s.exists() && s.val().pass === p) { session = s.val(); loginOk(); }
        else alert("LOGIN GAGAL!");
    });
}

function loginOk() { localStorage.setItem('zerx_session', JSON.stringify(session)); monitorAccount(); }
function doLogout() { localStorage.removeItem('zerx_session'); location.reload(); }

function doGenerate() {
    let k = (document.getElementById('key_type').value === 'random') ? "ZERX-" + Math.random().toString(36).substr(2,6).toUpperCase() : document.getElementById('custom_key_input').value.toUpperCase();
    db.ref('license/'+k).set({
        game: document.getElementById('g_sel').value, day: document.getElementById('d_sel').value,
        max_device: parseInt(document.getElementById('max_dev_input').value), used: 0, status: "AKTIF", owner: session.user
    }).then(() => alert("KEY CREATED: " + k));
}

function loadKeys() {
    db.ref('license').on('value', s => {
        let h = "";
        s.forEach(k => {
            const v = k.val();
            if(session.role === "OWNER" || session.role === "ADMIN" || v.owner === session.user) {
                const info = `NAMA GAME : ${v.game}\\nDAY : ${v.day}\\nTERPAKAI : ${v.used}/${v.max_device}`;
                h += `<div class="item-card"><b style="color:var(--cyan)">${k.key}</b><div style="margin-top:8px; display:flex; gap:8px;">
                <button onclick="alert('${info}')" style="background:#0055ff; font-size:9px; height:30px;">DETAIL</button>
                <button onclick="confirm('Hapus?') ? db.ref('license/${k.key}').remove() : null" style="background:red; font-size:9px; height:30px;">DELETE</button>
                </div></div>`;
            }
        });
        document.getElementById('key-list').innerHTML = h || "KOSONG";
    });
}

function saveNewUser() {
    const u = document.getElementById('new_u').value, p = document.getElementById('new_p').value, r = document.getElementById('new_r').value, e = document.getElementById('new_e_date').value;
    if(!u || !p || !e) return alert("LENGKAPI DATA!");
    db.ref('users/'+u).set({user:u, pass:p, role:r, expiry:e}).then(() => { alert("USER CREATED!"); show('home-screen'); });
}

function loadUsers() {
    db.ref('users').on('value', s => {
        let h = "";
        s.forEach(u => {
            const v = u.val();
            h += `<div class="item-card"><b>${v.user}</b> <small>(${v.role})</small>
            <button onclick="db.ref('users/${v.user}').remove()" style="float:right; background:red; font-size:9px; width:65px; padding:5px;">DELETE</button><div style="clear:both"></div></div>`;
        });
        document.getElementById('user-list-area').innerHTML = h || "KOSONG";
    });
}

function toggleKeyInput() { document.getElementById('custom_key_input').classList.toggle('hidden', document.getElementById('key_type').value === 'random'); }

// Background
const cvs = document.getElementById('starCanvas'); const ctx = cvs.getContext('2d');
cvs.width = window.innerWidth; cvs.height = window.innerHeight;
let stars = []; for(let i=0; i<100; i++) stars.push({x:Math.random()*cvs.width, y:Math.random()*cvs.height, s:Math.random()*1.5});
function drawStars() {
    ctx.clearRect(0,0,cvs.width,cvs.height); ctx.fillStyle="#fff";
    stars.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, 7); ctx.fill(); s.y+=0.5; if(s.y>cvs.height) s.y=0; });
    requestAnimationFrame(drawStars);
}
