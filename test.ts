// main.ts
// This script runs on every webpage and replaces the word "3,499" with "3,500"

// A regex that matches the word "3,499" with optional spaces and punctuation around it
const regex: RegExp = /\b\s*([,.:;!?()'"-]*)(3,499)([,.:;!?()'"-]*)\s*\b/gi;

// A function that takes a node, a regex, and a callback
// It searches for the regex in the node's text and applies the callback to the matches
function matchText(node: Node, regex: RegExp, callback: Function, excludeElements?: string[]): Node {
  excludeElements = excludeElements || ['script', 'style', 'iframe', 'canvas', 'a'];
  let child: Node | null = node.firstChild;
  while (child) {
    switch (child.nodeType) {
      case 1:
        if (excludeElements.indexOf((child as Element).tagName.toLowerCase()) > -1)
          break;
        matchText(child, regex, callback, excludeElements);
        break;
      case 3:
        let bk: number = 0;
        (child as Text).data.replace(regex, function (all) {
          const args: any[] = [].slice.call(arguments),
            offset: number = args[args.length - 2],
            newTextNode: Text = (child as Text).splitText(offset + bk),
            tag: Node;
          bk -= (child as Text).data.length + all.length;
          newTextNode.data = newTextNode.data.substr(all.length);
          tag = callback.apply(window, [(child as Text)].concat(args));
          child!.parentNode!.insertBefore(tag, newTextNode);
          child = newTextNode;
        });
        regex.lastIndex = 0;
        break;
    }
    child = child.nextSibling;
  }
  return node;
};

// A callback that creates a span element with the word "3,500" and the same punctuation as the original match
// It only replaces "3,499" with "3,500"
function callback(node: Text, match: string, p1: string, p2: string, p3: string, offset: number): Node {
  if (p2 === '3,499') {
    const span: HTMLSpanElement = document.createElement('span');
    span.textContent = p1 + '3,500' + p3;
    span.style.color = 'red'; // You can change the style of the replaced word here
    return span;
  } else {
    return document.createTextNode(match);
  }
};

// Apply the matchText function to the document body
matchText(document.body, regex, callback, ["script", "style"]);
