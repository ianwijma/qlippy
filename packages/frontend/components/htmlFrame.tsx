import {PropsWithChildren, useEffect, useRef} from "react";


const resetCss = `
/* http://meyerweb.com/eric/tools/css/reset/ 
   v2.0 | 20110126
   License: none (public domain)
*/

html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed, 
figure, figcaption, footer, header, hgroup, 
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure, 
footer, header, hgroup, menu, nav, section {
    display: block;
}
body {
    line-height: 1;
}
ol, ul {
    list-style: none;
}
blockquote, q {
    quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
    content: '';
    content: none;
}
table {
    border-collapse: collapse;
    border-spacing: 0;
}
`

const additionalCSs = `
html {
    overflow: hidden;
}
`

export type HtmlFrameProps = PropsWithChildren & {};
export const HtmlFrame = ({children}: HtmlFrameProps) => {
    const html = children;
    const ref = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const frameEl = ref.current;

        if (!frameEl) return;

        const handleOnLoad = () => {
            // set the height of the iframe as
            // the height of the iframe content
            frameEl.style.height = frameEl.contentWindow.document.body.scrollHeight + 'px';

            // set the width of the iframe as the
            // width of the iframe content
            frameEl.style.width  = frameEl.contentWindow.document.body.scrollWidth + 'px';
        };

        frameEl.addEventListener('load', handleOnLoad);

        handleOnLoad(); // trigger it!~

        return () => frameEl.removeEventListener('load', handleOnLoad);
    }, [ref]);

    return <iframe className="w-full h-full pointer-events-none border-0" ref={ref} srcDoc={`<style>${resetCss} ${additionalCSs}</style> ${html}`} />
}