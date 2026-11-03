function accessCookieOptions(){return {httpOnly:true,secure:process.env.COOKIE_SECURE==='true',sameSite:'lax',path:'/',maxAge:7*24*60*60*1000};}
function refreshCookieOptions(){return {httpOnly:true,secure:process.env.COOKIE_SECURE==='true',sameSite:'lax',path:'/',maxAge:30*24*60*60*1000};}
function setSessionCookies(res,session){res.cookie('movix_session',session.access_token,accessCookieOptions());if(session.refresh_token)res.cookie('movix_refresh',session.refresh_token,refreshCookieOptions());}
function clearSessionCookies(res){const common={httpOnly:true,secure:process.env.COOKIE_SECURE==='true',sameSite:'lax',path:'/'};res.clearCookie('movix_session',common);res.clearCookie('movix_refresh',common);}
module.exports={setSessionCookies,clearSessionCookies};
