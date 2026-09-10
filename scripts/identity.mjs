import {createHash} from 'node:crypto';

function headerMap(headers){
  return Object.fromEntries(Object.entries(headers||{}).map(([k,v])=>[String(k).toLowerCase(), Array.isArray(v)?v[0]:v]));
}

export function nameFromDn(dn){
  if(!dn) return '';
  const m=String(dn).match(/(?:^|,)\s*CN\s*=\s*([^,\/]+)/i);
  return (m?m[1]:String(dn)).replace(/^"|"$/g,'').trim();
}

export function emailFromDn(dn){
  if(!dn) return '';
  const m=String(dn).match(/(?:^|,)\s*(?:E|EMAILADDRESS|emailAddress)\s*=\s*([^,\/]+)/i);
  return m?m[1].replace(/^"|"$/g,'').trim():'';
}

export function sanitizeUserId(raw){
  const s=String(raw||'').trim().toLowerCase().replace(/[^a-z0-9._@+-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,120);
  return s;
}

export function identityFromHeaders(headers,{allowQueryUser, queryUser}={}){
  const h=headerMap(headers);
  const dn=h['ssl-client-s-dn']||h['x-ssl-client-s-dn']||h['x-client-cert-dn']||h['x-client-dn']||'';
  const email=emailFromDn(dn)||(h['x-forwarded-email']||h['x-user-email']||'').trim();
  const proxyUser=(h['x-forwarded-user']||h['x-remote-user']||h['remote-user']||'').trim();
  const devUser=allowQueryUser?(h['x-dev-user']||'').trim():'';
  const display=(h['x-user-name']||nameFromDn(dn)||proxyUser||devUser||email||'').trim();
  let id='';
  let source='';
  if(email){ id=sanitizeUserId(email); source='email'; }
  else if(proxyUser){ id=sanitizeUserId(proxyUser); source='proxy'; }
  else if(dn){ id=sanitizeUserId('dn-'+createHash('sha256').update(String(dn)).digest('hex').slice(0,24)); source='cert'; }
  else if(allowQueryUser && (devUser||queryUser)){ id=sanitizeUserId(devUser||queryUser); source=devUser?'proxy':'query'; }
  const name=(display||queryUser||'').replace(/^"|"$/g,'').trim().slice(0,80);
  return {
    id,
    name: name || id,
    dn: dn||'',
    authenticated: !!id,
    source
  };
}
