import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';


export function update( message, state ) {
  return [ state, Cmd.none ];
}

export function init() {
  return [ {}, Cmd.none ];
}

export function view( { state, dispatch } ) {
  return <div class={{container: true}}>
    <h1>The Ximera Xloud</h1>
    <p>You can post your own content on the xloud.</p>
    <p>Place a TeX file on GitHub using <code>\documentclass{'{ximera}'}</code>.</p>
    <p>For example, in the repository <a href="https://github.com/mooculus/calculus">mooculus/calculus</a>, there is a file <a href="https://github.com/mooculus/calculus/blob/master/derivativesOfInverseFunctions/digInDerivativesOfInverseTrigonometricFunctions.tex">derivativesOfInverseFunctions/digInDerivativesOfInverseTrigonometricFunctions.tex</a>.  It uses <code>\documentclass{'{ximera}'}</code>.</p>
    <p>By going to <a href="https://ximera.cloud/mooculus/calculus/derivativesOfInverseFunctions/digInDerivativesOfInverseTrigonometricFunctions" rel="nofollow">https://ximera.cloud/mooculus/calculus/derivativesOfInverseFunctions/digInDerivativesOfInverseTrigonometricFunctions</a>, your browser will download the necessary files, compile the <code>.tex</code> file, and render it.</p>
    <p><strong>tl;dr: go to <a href="https://ximera.cloud/username/repository/pathname" rel="nofollow">https://ximera.cloud/username/repository/pathname</a></strong></p>
    </div>
}

export default { view, init, update };
