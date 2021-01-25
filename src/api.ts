const API_ROOT = process.env.API_ROOT;

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

export async function getAnonymousToken() {
  let headers = new Headers();

  let response = await fetch(API_ROOT+'users/anonymous/token',
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

export async function patchProfile(token, id, delta) {
  let headers = new Headers();

  headers.append('Authorization', 'Bearer ' + token);
  headers.append('Content-Type','application/json');

  let response = await fetch(API_ROOT+'users/'+id,
                             {method:'PUT',
                              headers,
                              body: JSON.stringify(delta)
                             });
  
  if (!response.ok) {
    throw Error(response.statusText);
  }
  
  let body = await response.json();
  
  return body;
}

export default { getToken, getAnonymousToken, getUser, patchProfile };
