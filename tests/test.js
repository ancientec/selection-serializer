var el = document.getElementById("container");
var orginalHTML = el.innerHTML;

describe('collasped selection', () => {
    
    it('selection is at beginning', () => {
        //test at start:
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(el, 0);
        range.setEnd(el, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        chai.expect(window.SelectionSerializer.save(el)).to.eql({"startContainer":[],"startOffset":0,"endContainer":[],"endOffset":0,"direction":"none"});
        chai.expect(window.SelectionSerializer.saveSlim(el)).to.eql({"s":[],"so":0,"e":[],"eo":0,"d":"n"});
    });
    it('selection is at end', () => {
        //test at end:
        var range = document.createRange();
        var sel = window.getSelection();
        range.setEndAfter(el.lastChild);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        chai.expect(window.SelectionSerializer.save(el)).to.eql({"startContainer":[],"startOffset":2,"endContainer":[],"endOffset":2,"direction":"none"});
        chai.expect(window.SelectionSerializer.saveSlim(el)).to.eql({"s":[],"so":2,"e":[],"eo":2,"d":"n"});
    });
    it('selection is in middle', () => {
        //test at start:
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(el.childNodes[1].childNodes[0], 7);
        range.setEnd(el.childNodes[1].childNodes[0], 7);
        sel.removeAllRanges();
        sel.addRange(range);
        chai.expect(window.SelectionSerializer.saveSlim(el)).to.eql({"s":[0,1],"so":7,"e":[0,1],"eo":7,"d":"n"});
        chai.expect(window.SelectionSerializer.save(el)).to.eql({"startContainer":[0,1],"startOffset":7,"endContainer":[0,1],"endOffset":7,"direction":"none"});
    });
});
describe('forward selection', () => {

    it('forward selection', () => {
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(el.childNodes[0], 5);// of doc
        range.setEnd(el.childNodes[1].childNodes[2], 6);
        sel.removeAllRanges();
        sel.addRange(range);
        var selection = window.SelectionSerializer.save(el);
        chai.expect(selection).to.eql({"startContainer":[0],"startOffset":5,"endContainer":[2,1],"endOffset":6,"direction":"forward"});
    });
    it('forward selection slim', () => {
        chai.expect(window.SelectionSerializer.saveSlim(el)).to.eql({"s":[0],"so":5,"e":[2,1],"eo":6,"d":"f"});
    });
    it('restore selection', () => {
        //reset
        var range = document.createRange();
        var sel = window.getSelection();
        range.setEndAfter(el.lastChild);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        chai.expect(window.SelectionSerializer.save(el)).to.eql({"startContainer":[],"startOffset":2,"endContainer":[],"endOffset":2,"direction":"none"});

        window.SelectionSerializer.restore(el, {"startContainer":[0],"startOffset":5,"endContainer":[2,1],"endOffset":6,"direction":"forward"});

        var restoreSel = window.getSelection();
        var restoreRange = restoreSel.getRangeAt(0);
        chai.expect(restoreRange.startContainer).to.eql(el.childNodes[0]);
        chai.expect(restoreRange.startOffset).to.eql(5);
        chai.expect(restoreRange.endContainer).to.eql(el.childNodes[1].childNodes[2]);
        chai.expect(restoreRange.endOffset).to.eql(6);
    });
});
describe('backward selection', () => {
    it('backward selection', () => {
        var range = document.createRange();
        var sel = window.getSelection();
        sel.removeAllRanges();
        range.setStart(el.childNodes[1].childNodes[2], 6);
        range.setEnd(el.childNodes[1].childNodes[2], 6);
        sel.addRange(range);
        sel.extend(el.childNodes[0], 5);
        var selection = window.SelectionSerializer.save(el);
        chai.expect(selection).to.eql({"startContainer":[0],"startOffset":5,"endContainer":[2,1],"endOffset":6,"direction":"backward"});
      });
    it('backward selection slim', () => {
        chai.expect(window.SelectionSerializer.saveSlim(el)).to.eql({"s":[0],"so":5,"e":[2,1],"eo":6,"d":"b"});
    });
    it('restore selection', () => {
        //reset
        var range = document.createRange();
        var sel = window.getSelection();
        range.setEndAfter(el.lastChild);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        chai.expect(window.SelectionSerializer.save(el)).to.eql({"startContainer":[],"startOffset":2,"endContainer":[],"endOffset":2,"direction":"none"});

        window.SelectionSerializer.restore(el, {"startContainer":[0],"startOffset":5,"endContainer":[2,1],"endOffset":6,"direction":"backward"});

        var restoreSel = window.getSelection();
        var restoreRange = restoreSel.getRangeAt(0);
        chai.expect(restoreSel.focusNode).to.eql(el.childNodes[0]);
        chai.expect(restoreSel.focusOffset).to.eql(5);
        chai.expect(restoreRange.startContainer).to.eql(el.childNodes[0]);
        chai.expect(restoreRange.startOffset).to.eql(5);
        chai.expect(restoreRange.endContainer).to.eql(el.childNodes[1].childNodes[2]);
        chai.expect(restoreRange.endOffset).to.eql(6);
    });
});
describe('out of container selection', () => {
    
    it('selection before container, default to end of content container', () => {
        //select word:editable
        var range = document.createRange();
        var sel = window.getSelection();
        sel.removeAllRanges();
        range.setStart(el.previousElementSibling.lastChild, 7);
        range.setEnd(el.previousElementSibling.lastChild, 15);
        sel.addRange(range);
        chai.expect(window.SelectionSerializer.save(el)).to.eql({"startContainer":[1],"startOffset":3,"endContainer":[1],"endOffset":3,"direction":"none"});
    });
    it('selection after container, default to end of content container', () => {
        //select word:editable
        var range = document.createRange();
        var sel = window.getSelection();
        sel.removeAllRanges();
        range.setStart(el.nextElementSibling.lastChild, 6);
        range.setEnd(el.nextElementSibling.lastChild, 14);
        sel.addRange(range);
        chai.expect(window.SelectionSerializer.save(el)).to.eql({"startContainer":[1],"startOffset":3,"endContainer":[1],"endOffset":3,"direction":"none"});
    });
});
describe('selection contains container', () => {

    it('selection contains container: select all', () => {
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(el.previousElementSibling.childNodes[0], 16);
        range.setEnd(el.nextElementSibling.childNodes[0], 5);
        sel.removeAllRanges();
        sel.addRange(range);
        var selection = window.SelectionSerializer.save(el);
        chai.expect(selection).to.eql({"startContainer":[0],"startOffset":0,"endContainer":[1],"endOffset":3,"direction":"forward"});
    });
});
describe('selection partial contains  beginning of container', () => {

    it('selection contains container: select from beginning', () => {
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(el.previousElementSibling.childNodes[0], 0);
        range.setEnd(el.childNodes[1].childNodes[0], 5);
        sel.removeAllRanges();
        sel.addRange(range);
        var selection = window.SelectionSerializer.save(el);
        chai.expect(selection).to.eql({"startContainer":[0],"startOffset":0,"endContainer":[0,1],"endOffset":5,"direction":"forward"});
        window.SelectionSerializer.restore(el, selection);
        chai.expect(selection).to.eql(window.SelectionSerializer.save(el));
    });
});

describe('selection partial contains end of container', () => {

    it('selection contains container: select to end', () => {
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(el.childNodes[0], 3);
        range.setEnd(el.nextElementSibling.childNodes[0], el.nextElementSibling.childNodes[0].textContent.length);
        sel.removeAllRanges();
        sel.addRange(range);
        var selection = window.SelectionSerializer.save(el);
        chai.expect(selection).to.eql({"startContainer":[0],"startOffset":3,"endContainer":[1],"endOffset":3,"direction":"forward"});
        window.SelectionSerializer.restore(el, selection);
        chai.expect(selection).to.eql(window.SelectionSerializer.save(el));
    });
});
