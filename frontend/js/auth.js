(() => {
  const roleKey='movix-role';
  window.MovixAuth={role:()=>localStorage.getItem(roleKey)||'owner',setRole(role){localStorage.setItem(roleKey,role)},async logout(){try{await MovixAPI.post('/auth/logout',{})}catch{}localStorage.removeItem(roleKey);window.location.href='/pages/login.html'},async session(){try{return await MovixAPI.get('/auth/session')}catch{return null}}};
})();
