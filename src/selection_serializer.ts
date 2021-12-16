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
function saveSlim(contentContainer : HTMLElement) : SelectionSlimState {
    return saveSelection(contentContainer, true) as SelectionSlimState;
}
function saveSelection(contentContainer : HTMLElement, returnSlim : boolean = false) : SelectionState | SelectionSlimState {
    const selection =  window.getSelection();
    //selection has set:
    if (!selection || selection.rangeCount === 0) {
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
    /*
    test and reset selection if it is out of contentContainer
    */
    //case 1: if contentContainer within range, select  all contentContainer:
    if(range.intersectsNode(contentContainer)) {
        if(!contentContainer.contains(range.startContainer)) {
            range.setStart(contentContainer.childNodes.length === 0 ? contentContainer : contentContainer.childNodes[0],0);
        }
        if(!contentContainer.contains(range.endContainer)) {
            if(!contentContainer.childNodes.length) {
                range.setEnd(contentContainer, 0);
            } else {
                const n = contentContainer.childNodes[contentContainer.childNodes.length - 1];
                if(n.nodeType === 3) {
                    range.setEnd(n, (n.textContent || "").length);
                } else {
                    range.setEnd(n, n.childNodes.length);
                }
            }
        }
    } 
    //case 2: if range is anywhere outside of contentContainer, new range collapsed to end of contentContainer
    else if(!contentContainer.contains(range.startContainer) || !contentContainer.contains(range.endContainer)) {
        range.setStart(contentContainer.childNodes.length === 0 ? contentContainer : contentContainer.childNodes[0],0);
        if(!contentContainer.childNodes.length) {
            range.setEnd(contentContainer, 0);
        } else {
            const n = contentContainer.childNodes[contentContainer.childNodes.length - 1];
            if(n.nodeType === 3) {
                range.setEnd(n, (n.textContent || "").length);
            } else {
                range.setEnd(n, n.childNodes.length);
            }
            
        }
        range.collapse(false);
    }

    const startContainer = nodeMapping(contentContainer, range.startContainer),
    startOffset = range.startOffset,
    endContainer = range.startContainer === range.endContainer ? startContainer : nodeMapping(contentContainer, range.endContainer),
    endOffset = range.endOffset;

    let direction =  "none";
    if(!selection.isCollapsed && selection.anchorNode !== selection.focusNode && selection.anchorNode && selection.focusNode) {
        if(selection.anchorNode.compareDocumentPosition(selection.focusNode) & Node.DOCUMENT_POSITION_FOLLOWING) {
            direction = "forward";
        } else if(selection.anchorNode.compareDocumentPosition(selection.focusNode) & Node.DOCUMENT_POSITION_PRECEDING) {
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
    if(startContainer.nodeType === Node.TEXT_NODE && startContainer.textContent!.length < sel.startOffset) {
        sel.startOffset = startContainer.textContent!.length;
    } else if(startContainer.childNodes.length >= 1  && startContainer.childNodes.length < sel.startOffset) {
        sel.startOffset = startContainer.childNodes.length-1;
    }
    let endContainer = contentContainer as ChildNode;
    for(let i = sel.endContainer.length - 1; i >= 0; i --) {
        if (endContainer.childNodes && endContainer.childNodes.length > sel.endContainer[i] && endContainer.childNodes[sel.endContainer[i]]) {
            endContainer = endContainer.childNodes[sel.endContainer[i]];
        }
    }
    if(endContainer.nodeType === Node.TEXT_NODE && endContainer.textContent!.length < sel.endOffset) {
        sel.endOffset = endContainer.textContent!.length;
    } else if(endContainer.childNodes.length >= 1  && endContainer.childNodes.length < sel.endOffset) {
        sel.endOffset = endContainer.childNodes.length-1;
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
        saveSlim : saveSlim,
        restore : restoreSelection
    
    };
}

export default {
    save : saveSelection,
    saveSlim : saveSlim,
    restore : restoreSelection
}