const API_ROOT='http://localhost:4000/';

export async function getToken(email, password) {
  let headers = new Headers();

  headers.append('Authorization', 'Basic ' + btoa(email + ":" + password));

  let response = await fetch(API_ROOT+'users/'+email+'/token',
                          {method:'GET',
                           headers: headers,
                          });
  
  if (!response.ok) {
    throw Error(response.statusText);
  }
  
  let body = await response.json();
  
  return body;
}

export async function getUser(token, id) {
  let headers = new Headers();

  headers.append('Authorization', 'Bearer ' + token);

  let response = await fetch(API_ROOT+'users/'+id,
                          {method:'GET',
                           headers: headers,
                          });
  
  if (!response.ok) {
    throw Error(response.statusText);
  }
  
  let body = await response.json();
  
  return body;
}

export async function getRealm(token, id) {
  let headers = new Headers();

  headers.append('Authorization', 'Bearer ' + token);

  let response = await fetch(API_ROOT+'realms/'+id,
                          {method:'GET',
                           headers: headers,
                          });
  
  if (!response.ok) {
    throw Error(response.statusText);
  }
  
  let body = await response.json();
  
  return body;
}

export async function getRealms(token) {
  let headers = new Headers();

  headers.append('Authorization', 'Bearer ' + token);

  let response = await fetch(API_ROOT+'realms/',
                          {method:'GET',
                           headers: headers,
                          });
  
  if (!response.ok) {
    throw Error(response.statusText);
  }
  
  let body = await response.json();
  
  return body;
}

export default { getToken, getUser, getRealms, getRealm };
