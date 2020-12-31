import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';

function Award( { id } ) {
  return <a href={`http://www.nsf.gov/awardsearch/showAward?AWD_ID=${id}`}>DUE-{id}</a>;
}

function Responsive( { long, short } ) {
  return <span><span class={{"d-none":true, "d-md-inline":true}}>{ long }</span><span class={{"d-inline":true, "d-md-none":true}}>{ short }</span></span>;
}

export function view( { state, dispatch } ) {
  return <footer class={{"footer":true, "mt-auto":true, "py-3":true, "bg-dark":true, "text-white":true}}>
    <div class={{"container":true}}>
    <span class={{"text-muted":true}}>Coded by <a href="https://kisonecat.com/">kisonecat</a>.  Drawn by <a href="mailto:limezu.pixel@gmail.com">limezu.pixel</a> under a CC-BY license.</span>
       </div>
    </footer>;
}

export default view;
