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

export default { getToken };
