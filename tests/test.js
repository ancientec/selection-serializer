var el = document.getElementById("container");
var orginalHTML = el.innerHTML;

describe('collasped selection', () => {
    el.innerHTML = "";
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(el, 0);
    range.setEnd(el, 0);
    sel.removeAllRanges();
    sel.addRange(range);
    var selection = window.SelectionSerializer.save(el);
    el.innerHTML = orginalHTML;

    it('selection is empty', () => {
      chai.expect(JSON.stringify(selection)).to.eql('{"startContainer":[],"startOffset":0,"endContainer":[],"endOffset":0,"direction":"none"}');
    });

    var selectionSlim = window.SelectionSerializer.save(el, true);

    it('select all slim', () => {
        chai.expect(JSON.stringify(selectionSlim)).to.eql('{"s":[],"so":0,"e":[],"eo":0,"d":"n"}');
    });
    //test restore:
    sel.removeAllRanges();
    window.SelectionSerializer.restore(el, selection);

    var restoreSel = window.getSelection();
    var restoreRange = restoreSel.getRangeAt(0);
    it('restore start container', () => {
        chai.expect(restoreRange.startContainer).to.eql(el);
        chai.expect(restoreRange.startOffset).to.eql(0);
    });
    it('restore end container', () => {
        chai.expect(restoreRange.endContainer).to.eql(el);
        chai.expect(restoreRange.endOffset).to.eql(0);
    });

});

describe('forward selection', () => {

    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(el.childNodes[0], 5);// of doc
    range.setEnd(el.childNodes[1].childNodes[2], 6);
    sel.removeAllRanges();
    sel.addRange(range);
    var selection = window.SelectionSerializer.save(el);
    //console.log(JSON.stringify(selection));

    it('forward selection', () => {
      chai.expect(JSON.stringify(selection)).to.eql('{"startContainer":[0],"startOffset":5,"endContainer":[2,1],"endOffset":6,"direction":"forward"}');
    });

    var selectionSlim = window.SelectionSerializer.save(el, true);

    it('forward selection slim', () => {
        chai.expect(JSON.stringify(selectionSlim)).to.eql('{"s":[0],"so":5,"e":[2,1],"eo":6,"d":"f"}');
    });
    //test restore:
    sel.removeAllRanges();
    window.SelectionSerializer.restore(el, selection);

    var restoreSel = window.getSelection();
    var restoreRange = restoreSel.getRangeAt(0);
    it('restore start container', () => {
        chai.expect(restoreRange.startContainer).to.eql(el.childNodes[0]);
        chai.expect(restoreRange.startOffset).to.eql(5);
    });
    it('restore end container', () => {
        chai.expect(restoreRange.endContainer).to.eql(el.childNodes[1].childNodes[2]);
        chai.expect(restoreRange.endOffset).to.eql(6);
    });

});

describe('backward selection', () => {
    var range = document.createRange();
    var sel = window.getSelection();
    sel.removeAllRanges();
    range.setStart(el.childNodes[1].childNodes[2], 6);
    range.setEnd(el.childNodes[1].childNodes[2], 6);
    sel.addRange(range);
    sel.extend(el.childNodes[0], 5);
    var selection = window.SelectionSerializer.save(el);
    //console.log(sel,JSON.stringify(selection));

    it('backward selection', () => {
      chai.expect(JSON.stringify(selection)).to.eql('{"startContainer":[0],"startOffset":5,"endContainer":[2,1],"endOffset":6,"direction":"backward"}');
    });

    var selectionSlim = window.SelectionSerializer.save(el, true);

    it('sbackward selection slim', () => {
        chai.expect(JSON.stringify(selectionSlim)).to.eql('{"s":[0],"so":5,"e":[2,1],"eo":6,"d":"b"}');
    });
    //test restore:
    sel.removeAllRanges();
    window.SelectionSerializer.restore(el, selection);

    var restoreSel = window.getSelection();
    var restoreRange = restoreSel.getRangeAt(0);
    it('restore start container', () => {
        chai.expect(restoreRange.startContainer).to.eql(el.childNodes[0]);
        chai.expect(restoreRange.startOffset).to.eql(5);
    });
    it('restore end container', () => {
        chai.expect(restoreRange.endContainer).to.eql(el.childNodes[1].childNodes[2]);
        chai.expect(restoreRange.endOffset).to.eql(6);
    });
    const focusNode = restoreSel.focusNode;
    const focusOffset = restoreSel.focusOffset;
    it('focusNode should be beginning', () => {
        chai.expect(focusNode).to.eql(el.childNodes[0]);
        chai.expect(focusOffset).to.eql(5);
    });
});

describe('extra selection', () => {

    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(el.previousElementSibling.childNodes[0], 16);
    range.setEnd(el.nextElementSibling.childNodes[0], 5);
    sel.removeAllRanges();
    sel.addRange(range);
    var selection = window.SelectionSerializer.save(el);
    //console.log(JSON.stringify(selection));

    it('extra selection', () => {
      chai.expect(JSON.stringify(selection)).to.eql('{"startContainer":[0],"startOffset":0,"endContainer":[1],"endOffset":3,"direction":"forward"}');
    });

    var selectionSlim = window.SelectionSerializer.save(el, true);

    it('extra selection slim', () => {
        chai.expect(JSON.stringify(selectionSlim)).to.eql('{"s":[0],"so":0,"e":[1],"eo":3,"d":"f"}');
    });
    //test restore:
    sel.removeAllRanges();
    window.SelectionSerializer.restore(el, selection);

    var restoreSel = window.getSelection();
    var restoreRange = restoreSel.getRangeAt(0);
    it('restore start container', () => {
        chai.expect(restoreRange.startContainer).to.eql(el.childNodes[0]);
        chai.expect(restoreRange.startOffset).to.eql(0);
    });
    it('restore end container', () => {
        chai.expect(restoreRange.endContainer).to.eql(el.childNodes[el.childNodes.length - 1]);
        chai.expect(restoreRange.endOffset).to.eql(el.childNodes[el.childNodes.length - 1].childNodes.length);
    });

});

describe('out of bound selection', () => {

    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(el.previousElementSibling.childNodes[0], 0);
    range.setEnd(el.previousElementSibling.childNodes[0], 10);
    sel.removeAllRanges();
    sel.addRange(range);
    var selection = window.SelectionSerializer.save(el);
    var selectionSlim = window.SelectionSerializer.save(el, true);
    //console.log(JSON.stringify(selection));

    it('put caret at beginning', () => {
      chai.expect(JSON.stringify(selection)).to.eql('{"startContainer":[0],"startOffset":0,"endContainer":[0],"endOffset":0,"direction":"none"}');
    });
    it('put caret at beginning(slim result)', () => {
        chai.expect(JSON.stringify(selectionSlim)).to.eql('{"s":[0],"so":0,"e":[0],"eo":0,"d":"n"}');
      });

    //test restore:
    sel.removeAllRanges();
    window.SelectionSerializer.restore(el, selection);

    var restoreSel = window.getSelection();
    var restoreRange = restoreSel.getRangeAt(0);
    //console.log(restoreRange);
    it('start container', () => {
        chai.expect(restoreRange.startContainer).to.eql(el.childNodes[0]);
        chai.expect(restoreRange.startOffset).to.eql(0);
    });
    it('end container', () => {
        chai.expect(restoreRange.endContainer).to.eql(el.childNodes[0]);
        chai.expect(restoreRange.endOffset).to.eql(0);
    });

});