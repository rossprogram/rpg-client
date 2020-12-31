export async function* none() {
  return;
}

export function sequence( a, b ) {
  return function(message, state) {
    let [newState, commands] = a(message, state);
    let [newerState, moreCommands] = b(message, newState);    

    return [newerState, async function* concat() {
      for await (const message of commands() ) {
        yield message;
      }

      for await (const message of moreCommands() ) {
        yield message;
      }      
      
      return;
    }];
  };
}

export default { none, sequence };
