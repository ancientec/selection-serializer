/*
* https://github.com/ancientec/selection-serializer
*
* Ancientec Co., Ltd. 
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

'use strict';

export interface SelectionState {
    //the element indexs from contentContainer
    startContainer : number[];
    //the focus offset index in current active element where cursor is at
    startOffset : number;
    endContainer : number[];
    endOffset : number;
    //forward, backward, none
    direction : string;
}
export interface SelectionSlimState {
    s : number[];
    so : number;
    e : number[];
    eo : number;
    //f=forward, b=backward, n=none
    d : string;
}

function nodeMapping(contentContainer : HTMLElement, el : Node) : number[] {
    let mapping : number[] = [];
    while (el !== contentContainer && el.parentNode) {
        mapping.push(Array.from(el.parentNode.childNodes).indexOf(el as ChildNode));
        el = el.parentNode;
    }
    
    return mapping;
}

function saveSelection(contentContainer : HTMLElement, returnSlim : boolean = false) : SelectionState | SelectionSlimState {
    const selection =  window.getSelection();
    //selection has set:
    if (!selection) {
        return !returnSlim ? {
            startContainer : [],
            startOffset : 0,
            endContainer : [],
            endOffset : 0,
            direction : "none"
        } : {
            s : [],
            so : 0,
            e : [],
            eo : 0,
            d : "n"
        }
    }
    const range = selection.getRangeAt(0);

    
    let startContainer = nodeMapping(contentContainer, range.startContainer),
        startOffset = range.startOffset;
    
    /*
    test and reset selection if it is out of contentContainer
    */
   let outOfBound = false;
    const compareStart = (contentContainer as Node).compareDocumentPosition(range.startContainer);
    if(range.startContainer !== contentContainer && compareStart !== Node.DOCUMENT_POSITION_CONTAINED_BY && compareStart !== Node.DOCUMENT_POSITION_CONTAINED_BY + Node.DOCUMENT_POSITION_FOLLOWING) {
        if(contentContainer.childNodes.length === 0) {
            startOffset = 0;
            startContainer = [];
            range.setStart(contentContainer, startOffset);
        } else {
            startOffset = 0;
            startContainer = [0];
            range.setStart(contentContainer.childNodes[0],0);
        }
        
        outOfBound = true;
    }
    
    let endContainer = range.startContainer === range.endContainer ? startContainer : nodeMapping(contentContainer, range.endContainer),
    endOffset = range.endOffset;
    const compareEnd = (contentContainer as Node).compareDocumentPosition(range.endContainer);
    if(range.endContainer !== contentContainer && compareEnd !== Node.DOCUMENT_POSITION_CONTAINED_BY && compareEnd !== Node.DOCUMENT_POSITION_CONTAINED_BY + Node.DOCUMENT_POSITION_FOLLOWING) {
        endOffset = contentContainer.childNodes.length - 1;
        
        endContainer = [];
        if(endOffset < 0) {
            endOffset = 0;
            range.setEnd(contentContainer, endOffset);
        } else {
            const n = contentContainer.childNodes[endOffset];
            if(n.nodeType === 3) {
                endOffset = (n.textContent || "").length;
                range.setEnd(n, endOffset);
            } else {
                endOffset = n.childNodes.length;
                range.setEnd(n, endOffset);
            }
            
        }
        
        outOfBound = true;
    }

    if(outOfBound) {
        startContainer = nodeMapping(contentContainer, range.startContainer),
        startOffset = range.startOffset,
        endContainer = range.startContainer === range.endContainer ? startContainer : nodeMapping(contentContainer, range.endContainer),
        endOffset = range.endOffset;
    }

    let direction =  "none";
    if(!selection.isCollapsed && selection.anchorNode !== selection.focusNode && selection.anchorNode && selection.focusNode) {
        if(selection.anchorNode.compareDocumentPosition(selection.focusNode) === Node.DOCUMENT_POSITION_FOLLOWING) {
            direction = "forward";
        } else if(selection.anchorNode.compareDocumentPosition(selection.focusNode) === Node.DOCUMENT_POSITION_PRECEDING) {
            direction = "backward";
        }
    }
    return !returnSlim ? {
        startContainer : startContainer,
        startOffset : startOffset,
        endContainer : endContainer,
        endOffset : endOffset,
        direction : direction
    } : {
        s : startContainer,
        so : startOffset,
        e : endContainer,
        eo : endOffset,
        d : direction.substring(0,1)
    }
}
function restoreSelection(contentContainer : HTMLElement, select : SelectionState | SelectionSlimState) : void {
    
    const selection = window.getSelection();
    selection?.removeAllRanges();

    const sel : SelectionState = select.hasOwnProperty("direction") ? select as SelectionState : {
        startContainer : (select as SelectionSlimState).s,
        startOffset : (select as SelectionSlimState).so,
        endContainer : (select as SelectionSlimState).e,
        endOffset : (select as SelectionSlimState).eo,
        direction : (select as SelectionSlimState).d
    };
    let startContainer = contentContainer as ChildNode;
    for(let i = sel.startContainer.length - 1; i >= 0; i--) {
        if (startContainer.childNodes && startContainer.childNodes.length > sel.startContainer[i] && startContainer.childNodes[sel.startContainer[i]]) {
            startContainer = startContainer.childNodes[sel.startContainer[i]];
        }
        
    }
    let endContainer = contentContainer as ChildNode;
    for(let i = sel.endContainer.length - 1; i >= 0; i --) {
        if (endContainer.childNodes && endContainer.childNodes.length > sel.endContainer[i] && endContainer.childNodes[sel.endContainer[i]]) {
            endContainer = endContainer.childNodes[sel.endContainer[i]];
        }
    }

    let newRange = document.createRange();
    if(sel.direction === "backward" || sel.direction === "b") {
        newRange.setStart(endContainer, sel.endOffset);
        newRange.setEnd(endContainer, sel.endOffset);
        selection?.addRange(newRange);
        selection?.extend(startContainer, sel.startOffset);
        newRange = selection?.getRangeAt(0)!;

    } else {
        newRange.setStart(startContainer, sel.startOffset);
        newRange.setEnd(endContainer, sel.endOffset);
        selection?.addRange(newRange);
    }
}

if(typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).SelectionSerializer = {
        save : saveSelection,
        restore : restoreSelection
    
    };
}

export default {
    save : saveSelection,
    restore : restoreSelection

}