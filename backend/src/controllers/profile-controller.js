const { getProfile, updateProfile } = require('../services/profile-service');
const { authRequest } = require('../services/supabase-auth-service');
const { getPool } = require('../config/database');
const crypto = require('crypto');
async function read(req,res) { const profile=await getProfile(req.user.id); if(!profile)return res.status(404).json({error:'Perfil não encontrado.',code:'PROFILE_MISSING'}); res.json({profile}); }
async function update(req,res) {
  const {full_name,phone,avatar_url,email}=req.body||{};
  if (full_name !== undefined && (typeof full_name!=='string'||full_name.trim().length<2||full_name.length>120)) return res.status(400).json({error:'Nome deve conter entre 2 e 120 caracteres.',code:'VALIDATION_ERROR'});
  if (phone!==undefined && phone!==null && (typeof phone!=='string'||phone.length>30)) return res.status(400).json({error:'Telefone inválido.',code:'VALIDATION_ERROR'});
  if (avatar_url!==undefined && avatar_url!==null && (typeof avatar_url!=='string'||avatar_url.length>2048||!/^https:\/\//.test(avatar_url))) return res.status(400).json({error:'A foto deve ser uma URL HTTPS válida.',code:'VALIDATION_ERROR'});
  let emailPending=false;
  if(email!==undefined && email!==req.user.email){ if(typeof email!=='string'||!/^\S+@\S+\.\S+$/.test(email))return res.status(400).json({error:'E-mail inválido.',code:'VALIDATION_ERROR'}); await authRequest('user','PUT',{email},req.cookies.movix_session); emailPending=true; }
  const profile=await updateProfile(req.user.id,{full_name:full_name?.trim(),phone,avatar_url});
  res.json({profile,emailPending,message:emailPending?'Confirme a alteração pelo e-mail enviado.':'Perfil atualizado.'});
}
async function uploadAvatar(req,res){
  if(!req.file)return res.status(400).json({error:'Selecione uma imagem.',code:'VALIDATION_ERROR'});
  const bucket='avatars';
  const ext={ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp' }[req.file.mimetype];
  if(!ext)return res.status(400).json({error:'Use uma imagem JPG, PNG ou WebP.',code:'VALIDATION_ERROR'});
  const bytes=req.file.buffer;
  const validImage=ext==='jpg'?bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff:ext==='png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
  if(!validImage)return res.status(400).json({error:'O arquivo não corresponde ao formato de imagem informado.',code:'INVALID_IMAGE'});
  const base=process.env.SUPABASE_URL?.replace(/\/$/,'');
  if(!base||!process.env.SUPABASE_ANON_KEY)throw Object.assign(new Error('Configure o Supabase Auth e Storage.'),{status:503});
  const key=`${req.user.id}/${crypto.randomUUID()}.${ext}`;
  const upload=await fetch(`${base}/storage/v1/object/${encodeURIComponent(bucket)}/${key.split('/').map(encodeURIComponent).join('/')}`,{method:'POST',headers:{apikey:process.env.SUPABASE_ANON_KEY,Authorization:`Bearer ${req.cookies.movix_session}`,'Content-Type':req.file.mimetype,'x-upsert':'true'},body:req.file.buffer});
  if(!upload.ok){const details=await upload.json().catch(()=>({}));throw Object.assign(new Error(details.message||'Não foi possível enviar a foto. Configure o bucket avatars e as políticas de Storage.'),{status:upload.status===413?413:400});}
  const avatar_url=`${base}/storage/v1/object/public/${encodeURIComponent(bucket)}/${key.split('/').map(encodeURIComponent).join('/')}`;
  const {rows}=await getPool().query('update profiles set avatar_url=$2,updated_at=now() where id=$1 returning id,full_name,email,phone,avatar_url,role,created_at,updated_at',[req.user.id,avatar_url]);
  res.json({profile:rows[0],message:'Foto de perfil atualizada.'});
}
module.exports={read,update,uploadAvatar};
