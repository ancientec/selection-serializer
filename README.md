# `selection-serializer` 

Lightweight helper function to serialize selection for wysiwyg editors.

[https://github.com/ancientec/selection-serializer ](https://github.com/ancientec/selection-serializer)

## Features
- Typescript ready
- Save and restore
- supports direction
- Slim output to keep the variable small

## Install

```shell
> npm install @ancientec/selection-serializer
```
## Develop & Unit Test

```shell
> git clone https://github.com/ancientec/selection-serializer
> cd selection-serializer
> npm install
> npm run build

#open tests/index.htm to see test result
```

## CDN
```html
https://unpkg.com/@ancientec/selection-serializer@1.0.0/dist/selection_serializer.min.js

https://cdn.jsdelivr.net/npm/@ancientec/selection-serializer@1.0.0/dist/selection_serializer.min.js
```

## Result

| Selection      | Slim Version | Example Value | Format |
| ----------- | ----------- | ----------- | ----------- |
| startContainer      | s       | []      | number[]      |
| startOffset   | so        | 0        | number       |
| endContainer      | e       | []      | number[]      |
| endOffset   | eo        | 0        | number       |
| direction   | d        | 'none' or 'n', 'forward' or 'f', backward or 'b'       | string       |

startContainer(or s) & endContainer(or e) contain the index values for the element relative to container element, default empty array to the container element. direction value none is collasped selection, backward selection means the caret (and focusNode) should be startContainer rather than endContainer.


## Usage & Example

```html
<!--quick start in html:-->
<script src="selection_serializer.min.js"></script>
<script>
      var containerDomElement = document.getElementById("contentEditableContainer");
      var selection = SelectionSerializer.save(containerDomElement);
      /*
      normal version:
      {"startContainer":[],"startOffset":0,"endContainer":[],"endOffset":0,"direction":"none"}
      */

      var selectionSlim = SelectionSerializer.save(containerDomElement, true);
      /*
      slim version(reduce characters) for better memory usage & storage:
      {"s":[],"so":0,"e":[],"eo":0,"d":"n"}
      */

      SelectionSerializer.restore(containerDomElement, selection);
</script>
```

## More Examples
Please see tests/test.js for more details.
```html
<h4>before editable container</h4>
    <div id="container" contenteditable="true" style="width:200px;height:200px">start of doc<p>1st paragraph, <span style="color:red">hightlighted text</span>end of doc</p></div>
    <div>after editable container</div>
```

```js

import SelectionSerializer from 'selection_serializer';

const el = document.getElementById("container");
var selection = window.SelectionSerializer.save(el);
//selection is empty or not in container scope, default to beginning of container:
//{"startContainer":[],"startOffset":0,"endContainer":[],"endOffset":0,"direction":"none"}
var selectionSlim = window.SelectionSerializer.save(el);
//{"s":[0],"so":0,"e":[0],"eo":0,"d":"n"}


//forward selection:
{"startContainer":[0],"startOffset":5,"endContainer":[2,1],"endOffset":6,"direction":"forward"}
{"s":[0],"so":5,"e":[2,1],"eo":6,"d":"f"}

//backward selection:
{"startContainer":[0],"startOffset":5,"endContainer":[2,1],"endOffset":6,"direction":"backward"}
{"s":[0],"so":5,"e":[2,1],"eo":6,"d":"b"}


//for selection overlaps and contains container, it will retrict selection only within container, this result is relative to the html above
{"startContainer":[0],"startOffset":0,"endContainer":[1],"endOffset":3,"direction":"forward"}
{"s":[0],"so":0,"e":[1],"eo":3,"d":"f"}

//for selection outside of container, return collasped selection at the beginning of container
{"startContainer":[0],"startOffset":0,"endContainer":[0],"endOffset":0,"direction":"none"}
{"s":[0],"so":0,"e":[0],"eo":0,"d":"n"}
```

## License

MIT